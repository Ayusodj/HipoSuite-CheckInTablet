import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface ObsequioRow {
  id: string;
  date: string; // ISO date yyyy-mm-dd
  room: string;
  repeats: number | '';
  name: string;
  note: string;
}

const STORAGE_KEY = 'obsequios_by_date_v1';

const todayIso = (d = new Date()) => d.toISOString().slice(0,10);

// parse an ISO yyyy-mm-dd into a local Date (avoid timezone shifts from Date(iso))
const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const isoFromDate = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2,'0');
  const d = date.getDate().toString().padStart(2,'0');
  return `${y}-${m}-${d}`;
}

const loadStorage = (): Record<string, ObsequioRow[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to load obsequios', e);
    return {};
  }
}

const saveStorage = (data: Record<string, ObsequioRow[]>) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e){console.error(e)}
}

const makeEmptyRow = (dateIso: string): ObsequioRow => ({ id: Math.random().toString(36).slice(2), date: dateIso, room: '', repeats: '', name: '', note: '' });

const formatDisplayDate = (iso: string) => {
  try { return format(parseIso(iso), "d 'de' MMMM"); } catch { return iso; }
}

const ObsequiosPage: React.FC = () => {
  const [dataMap, setDataMap] = useState<Record<string, ObsequioRow[]>>(() => loadStorage());
  const [from, setFrom] = useState<string>(todayIso());
  const [to, setTo] = useState<string>(todayIso());
  const [viewDates, setViewDates] = useState<string[]>([todayIso()]);
  const [selectedFilter, setSelectedFilter] = useState<'today'|'week'|'month'>('today');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [draftBuffer, setDraftBuffer] = useState<ObsequioRow>(() => ({ id: 'draft-today', date: todayIso(), room: '', repeats: '', name: '', note: '' }));

  // keep draft date in sync with selected visible date(s): if multiple dates selected, use the last visible date;
  // only change the draft date automatically when the draft is empty (so we don't overwrite typed content).
  useEffect(() => {
    const isDraftEmpty = draftBuffer.room === '' && draftBuffer.repeats === '' && draftBuffer.name === '' && draftBuffer.note === '';
    const dateForDraft = viewDates && viewDates.length > 1 ? viewDates[viewDates.length - 1] : from;
    if (isDraftEmpty && draftBuffer.date !== dateForDraft) {
      setDraftBuffer(b => ({ ...b, date: dateForDraft }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, viewDates]);

  useEffect(() => { saveStorage(dataMap); }, [dataMap]);

  // compute visible dates between from..to but only those that exist in dataMap
  useEffect(() => {
    const fromD = parseIso(from);
    const toD = parseIso(to);
    const days: string[] = [];
    for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate()+1)) {
      const iso = isoFromDate(d);
      if ((dataMap[iso] && dataMap[iso].length>0) || iso===from) {
        days.push(iso);
      }
    }
    setViewDates(days.length ? days : [from]);
  }, [from,to,dataMap]);

  // helper to get rows for first visible date (show all rows for selected dates in order)
  const visibleRows = useMemo(() => {
    const rows: ObsequioRow[] = [];
    viewDates.forEach(date => {
  const list = dataMap[date] || [];
  // filter out stored rows that are completely empty
  const filtered = list.filter(r => !(r.room === '' && (r.repeats === '' || r.repeats === 0) && r.name === '' && r.note === ''));
  rows.push(...filtered.map(r => ({...r})));
    });
      // ensure last row is empty to type into
    if (viewDates.length>0) {
      const lastDate = viewDates[viewDates.length-1];
      const list = dataMap[lastDate] || [];
      const last = list[list.length-1];
      if (!last || (last.room !== '' || last.repeats !== '' || last.name !== '' || last.note !== '')) {
        // append empty row to that date
        rows.push(makeEmptyRow(lastDate));
      }
    }
      // Always ensure there's a draft row at the end (visible on screen but not printed). Use the draftBuffer.date so
      // the draft reflects the selected date(s).
      const DRAFT_ID = 'draft-today';
      const draftDate = draftBuffer.date || todayIso();
      const hasDraft = rows.some(r => r.id === DRAFT_ID);
      if (!hasDraft) {
        rows.push({ id: DRAFT_ID, date: draftDate, room: '', repeats: '', name: '', note: '' });
      }
      return rows;
    }, [dataMap, viewDates, draftBuffer.date]);

  const upsertRow = (row: ObsequioRow) => {
    setDataMap(prev => {
      const map = { ...prev };
      const list = (map[row.date] || []).slice();
      const idx = list.findIndex(r => r.id === row.id);
      if (idx >= 0) list[idx] = row;
      else list.push(row);
      map[row.date] = list;
      return map;
    });
  };

  const handleCellChange = (id: string, date: string, field: keyof ObsequioRow, value: any) => {
    // find row in dataMap or create
    setDataMap(prev => {
      const map = { ...prev };
      const list = (map[date] || []).slice();
      const idx = list.findIndex(r=>r.id===id);
      if (idx>=0) {
        const copy = { ...list[idx], [field]: value };
        list[idx] = copy;
      } else {
        const newRow = makeEmptyRow(date);
        newRow[field] = value;
        list.push(newRow);
      }
      map[date] = list;

      // auto-append an empty row for the last date if needed
      const last = list[list.length-1];
      if (last && (last.room !== '' || last.repeats !== '' || last.name !== '' || last.note !== '')) {
        list.push(makeEmptyRow(date));
        map[date] = list;
      }

      return map;
    });
  };

  const commitDraft = () => {
    // if draft has any content, persist it as a new row for today
    const hasContent = draftBuffer.room !== '' || draftBuffer.repeats !== '' || draftBuffer.name !== '' || draftBuffer.note !== '';
    if (!hasContent) return;
  const date = draftBuffer.date || todayIso();
    setDataMap(prev => {
      const map = { ...prev };
      const list = (map[date] || []).slice();
      const newRow = makeEmptyRow(date);
      newRow.room = draftBuffer.room;
      newRow.repeats = draftBuffer.repeats;
      newRow.name = draftBuffer.name;
      newRow.note = draftBuffer.note;
      list.push(newRow);
      // ensure there's an empty row after
      list.push(makeEmptyRow(date));
      map[date] = list;
      return map;
    });
    // reset draft
  setDraftBuffer({ id: 'draft-today', date: draftBuffer.date || todayIso(), room: '', repeats: '', name: '', note: '' });
  };

  const setRangeToToday = () => { const t = todayIso(); setFrom(t); setTo(t); setSelectedFilter('today'); };
  const setRangeToWeek = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedFilter('week');
  };
  const setRangeToMonth = () => { const s = startOfMonth(new Date()); const e = endOfMonth(new Date()); setFrom(s.toISOString().slice(0,10)); setTo(e.toISOString().slice(0,10)); setSelectedFilter('month'); };

  const handlePrint = () => { window.print(); };
  const handleExportPdf = async () => {
    // generate a PDF programmatically using jspdf + autotable
    try {
      const mod = await import('jspdf');
      const jsPDFCtor = (mod && (mod.jsPDF || mod.default)) as any;
      if (!jsPDFCtor) throw new Error('jsPDF not found');
      await import('jspdf-autotable');

      const doc: any = new jsPDFCtor('p', 'mm', 'a4');
      const title = 'Obsequios';
      doc.setFontSize(14);
      const titleY = 18;
      doc.text(title, 14, titleY);

      // prepare rows excluding draft
      const rows = visibleRows
        .filter(r => r.id !== 'draft-today')
        .map(r => [formatDisplayDate(r.date), r.room || '', String(r.repeats || ''), r.name || '', r.note || '']);

      // Use plain theme; draw only thin horizontal separators between rows (no vertical lines, no header fill)
      ;(doc as any).autoTable({
        startY: titleY + 10,
        head: [['Día', 'Habitación', 'Veces', 'Nombre', 'Comentario']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [255,255,255], textColor: 20, halign: 'left' },
        theme: 'plain',
        tableLineColor: [255,255,255],
        tableLineWidth: 0,
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 25 }, 2: { cellWidth: 15 }, 3: { cellWidth: 55 }, 4: { cellWidth: 65 } },
        didDrawCell: (data: any) => {
          // draw a thin horizontal separator under each body row
          try {
            if (data.section === 'body' && data.column.index === 0) {
              const table = data.table || (data as any).table; // fallback
              const left = table ? (table.margin && table.margin.left ? table.margin.left : table.startX || 14) : 14;
              const width = table ? (table.width || (doc.internal.pageSize.getWidth() - left - 14)) : (doc.internal.pageSize.getWidth() - 28);
              const y = data.cell.y + data.cell.height;
              doc.setDrawColor(230);
              doc.setLineWidth(0.3);
              doc.line(left, y, left + width, y);
            }
          } catch (e) {
            // noop
          }
        }
      });

      doc.save('obsequios.pdf');
    } catch (e) {
      console.error('PDF export failed, falling back to print', e);
      window.print();
    }
  };

  return (
  <div style={{ backgroundColor: '#ffffff', color: '#000' }} className="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl h-full text-black overflow-y-auto">
      {/* print rule: hide draft rows */}
      <style>{`@media print { .obsequios-draft { display: none !important; } }`}</style>
      <div className="flex items-center justify-between mb-4">
      <div className="w-1/3 flex items-center space-x-2">
        {/* These are themed buttons and should use the app button color from Appearance */}
            <button onClick={setRangeToToday} className={`px-3 py-1 rounded-md ${selectedFilter==='today' ? 'app-selected-bg app-button-text-color' : 'bg-transparent text-black'}`}>Hoy</button>
            <button onClick={setRangeToWeek} className={`px-3 py-1 rounded-md ${selectedFilter==='week' ? 'app-selected-bg app-button-text-color' : 'bg-transparent text-black'}`}>Semana</button>
            <button onClick={setRangeToMonth} className={`px-3 py-1 rounded-md ${selectedFilter==='month' ? 'app-selected-bg app-button-text-color' : 'bg-transparent text-black'}`}>Mes</button>
          </div>
        <div className="w-1/3 text-center">
          <div className="text-lg font-semibold text-center">{viewDates.length===1 ? formatDisplayDate(viewDates[0]) : `${formatDisplayDate(viewDates[0])} — ${formatDisplayDate(viewDates[viewDates.length-1])}`}</div>
          <div className="mt-1 flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowCalendar(v => !v)} className="px-3 py-2 border rounded-md no-theme-button">
                {from === to ? formatDisplayDate(from) : `${formatDisplayDate(from)} — ${formatDisplayDate(to)}`}
              </button>
            </div>
            {showCalendar && (
              <div className="mt-3 p-3 border rounded-md bg-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="px-2 py-1">‹</button>
                  <div className="font-medium">{format(calendarMonth, 'LLLL yyyy')}</div>
                  <button onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="px-2 py-1">›</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-600 mb-1">
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => <div key={d} className="py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {(() => {
                    const first = startOfWeek(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1), { weekStartsOn: 1 });
                    const cells: Array<React.ReactNode> = [];
                    for (let i = 0; i < 42; i++) {
                      const d = new Date(first);
                      d.setDate(first.getDate() + i);
                      const iso = isoFromDate(d);
                      const inMonth = d.getMonth() === calendarMonth.getMonth();
                      const isStart = iso === from;
                      const isEnd = iso === to;
                      const inRange = parseIso(iso) >= parseIso(from) && parseIso(iso) <= parseIso(to);

                      const baseClasses = `py-2 rounded ${inMonth ? 'cursor-pointer' : 'text-gray-400'} `;

                      let style: React.CSSProperties | undefined = undefined;
                      let className = baseClasses;
                      if (isStart && isEnd) {
                        className += 'app-selected-bg app-button-text-color';
                      } else if (isStart) {
                        className += 'app-selected-bg app-button-text-color rounded-l-md';
                      } else if (isEnd) {
                        className += 'app-selected-bg app-button-text-color rounded-r-md';
                      } else if (inRange) {
                        style = { opacity: 0.25, backgroundColor: 'var(--app-selected-button-bg, var(--app-selected-bg))' };
                      }

                      cells.push(
                        <div key={iso} className={className} style={style} onClick={() => {
                          if (!inMonth) {
                            // navigate to that month
                            setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                          }
                          if (!pendingFrom) {
                            setFrom(iso); setTo(iso); setPendingFrom(iso);
                          } else {
                            if (pendingFrom === iso) {
                              setFrom(iso); setTo(iso); setPendingFrom(null); setShowCalendar(false);
                            } else {
                              const a = parseIso(pendingFrom);
                              const b = parseIso(iso);
                              if (a <= b) { setFrom(pendingFrom); setTo(iso); } else { setFrom(iso); setTo(pendingFrom); }
                              setPendingFrom(null);
                              setShowCalendar(false);
                            }
                          }
                        }}>{d.getDate()}</div>
                      );
                    }
                    return cells;
                  })()}
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  <button onClick={() => setShowCalendar(false)} className="px-3 py-1 border rounded-md">Cerrar</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/3 flex justify-end space-x-2">
          <button onClick={handleExportPdf} className="px-4 py-2 bg-rose-500 text-white rounded-md no-theme-button">Exportar PDF</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-teal-500 text-white rounded-md no-theme-button">Imprimir A4</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed text-black">
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '45%' }} />
          </colgroup>
          <thead>
            <tr className="text-center text-sm text-black">
              <th className="p-2 border-b border-black">Día</th>
              <th className="p-2 border-b border-black">Habitación</th>
              <th className="p-2 border-b border-black">Veces</th>
              <th className="p-2 border-b border-black">Nombre</th>
              <th className="p-2 border-b border-black">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(row => {
              const isDraft = row.id === 'draft-today';
              if (!isDraft) {
                return (
                  <tr key={row.id}>
                  <td className="p-2 align-middle border-b border-black text-center text-black" style={{verticalAlign:'middle'}}>{row.date}</td>
                  <td className="p-2 align-top border-b border-black"><input className={`w-full p-1 border rounded border-black text-black text-center`} value={row.room} onChange={e=>handleCellChange(row.id,row.date,'room',e.target.value)} /></td>
                  <td className="p-2 align-top border-b border-black"><input type="number" min={0} className={`w-full p-1 border rounded border-black text-black text-center`} value={row.repeats as any} onChange={e=>handleCellChange(row.id,row.date,'repeats', e.target.value === '' ? '' : Number(e.target.value))} /></td>
                  <td className="p-2 align-top border-b border-black"><input className={`w-full p-1 border rounded border-black text-black text-center`} value={row.name} onChange={e=>handleCellChange(row.id,row.date,'name',e.target.value)} /></td>
                  <td className="p-2 align-top border-b border-black"><input className={`w-full p-1 border rounded border-black text-black text-center`} value={row.note} onChange={e=>handleCellChange(row.id,row.date,'note',e.target.value)} /></td>
                </tr>
                );
              }

              // draft row: use local buffer and do not persist directly; hide in print
              return (
                <tr key={row.id} className="obsequios-draft">
                  <td className="p-2 align-middle border-b border-black text-center text-black" style={{verticalAlign:'middle'}}>{row.date}</td>
                  <td className="p-2 align-top border-b border-black"><input className={`w-full p-1 border rounded border-black text-black text-center opacity-60`} value={draftBuffer.room} onChange={e=>setDraftBuffer(b=>({...b, room: e.target.value}))} onBlur={commitDraft} onKeyDown={e=>{ if (e.key==='Enter') commitDraft(); }} /></td>
                  <td className="p-2 align-top border-b border-black"><input type="number" min={0} className={`w-full p-1 border rounded border-black text-black text-center opacity-60`} value={draftBuffer.repeats as any} onChange={e=>setDraftBuffer(b=>({...b, repeats: e.target.value === '' ? '' : Number(e.target.value)}))} onBlur={commitDraft} onKeyDown={e=>{ if (e.key==='Enter') commitDraft(); }} /></td>
                  <td className="p-2 align-top border-b border-black"><input className={`w-full p-1 border rounded border-black text-black text-center opacity-60`} value={draftBuffer.name} onChange={e=>setDraftBuffer(b=>({...b, name: e.target.value}))} onBlur={commitDraft} onKeyDown={e=>{ if (e.key==='Enter') commitDraft(); }} /></td>
                  <td className="p-2 align-top border-b border-black"><input className={`w-full p-1 border rounded border-black text-black text-center opacity-60`} value={draftBuffer.note} onChange={e=>setDraftBuffer(b=>({...b, note: e.target.value}))} onBlur={commitDraft} onKeyDown={e=>{ if (e.key==='Enter') commitDraft(); }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ObsequiosPage;
