import React, { useState } from 'react';
import CheckInForm from '../components/CheckInForm.tsx';

type Lang = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'nl' | 'be' | 'pl' | 'no' | 'sv' | 'fi' | 'cs';

const LANGUAGE_FLAGS: Record<Lang, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ru: '🇷🇺',
  nl: '🇳🇱',
  be: '🇧🇪',
  pl: '🇵🇱',
  no: '🇳🇴',
  sv: '🇸🇪',
  fi: '🇫🇮',
  cs: '🇨🇿'
};

const TRANSLATIONS: Record<Lang, any> = {
  es: {
    title: 'Check-in', choose: 'Elige Idioma', privacyTitle: 'Política de Privacidad',
    policyHtml: `Antes de comenzar, lea nuestra Política de Privacidad.`,
    labels: { nombre: 'Nombre', telefono: 'Tel', email: '@', cp: 'C.P', localidad: 'Localidad', calleNumero: 'Calle nº', enviar: 'Enviar', reset: 'Reset' }
  },
  en: {
    title: 'Validate your information', choose: 'Choose Language', privacyTitle: 'Privacy Policy',
    policyHtml: `Please read our Privacy Policy before starting.`,
    labels: { nombre: 'Name', telefono: 'Phone', email: 'Email', cp: 'ZIP', localidad: 'City', calleNumero: 'Street No', enviar: 'Send', reset: 'Reset' }
  },
  fr: {
    title: 'Validez vos informations', choose: 'Choisir la langue', privacyTitle: 'Politique de confidentialité',
    policyHtml: `Veuillez lire notre politique de confidentialité avant de commencer.`,
    labels: { nombre: 'Nom', telefono: 'Tél', email: 'Email', cp: 'CP', localidad: 'Ville', calleNumero: 'Rue nº', enviar: 'Envoyer', reset: 'Reset' }
  },
  de: {
    title: 'Bestätigen Sie Ihre Daten', choose: 'Sprache wählen', privacyTitle: 'Datenschutz-Bestimmungen',
    policyHtml: `Bitte lesen Sie unsere Datenschutzerklärung vor Beginn.`,
    labels: { nombre: 'Name', telefono: 'Tel', email: 'E-Mail', cp: 'PLZ', localidad: 'Ort', calleNumero: 'Straße Nr', enviar: 'Senden', reset: 'Zurücksetzen' }
  },
  it: {
    title: 'Conferma le tue informazioni', choose: 'Scegli la lingua', privacyTitle: 'Informativa sulla privacy',
    policyHtml: `Si prega di leggere la nostra Informativa sulla privacy prima di iniziare.`,
    labels: { nombre: 'Nome', telefono: 'Tel', email: 'Email', cp: 'CAP', localidad: 'Città', calleNumero: 'Via nº', enviar: 'Invia', reset: 'Reset' }
  },
  pt: {
    title: 'Valide suas informações', choose: 'Escolha o idioma', privacyTitle: 'Política de Privacidade',
    policyHtml: `Por favor, leia nossa Política de Privacidade antes de começar.`,
    labels: { nombre: 'Nome', telefono: 'Tel', email: 'Email', cp: 'CEP', localidad: 'Localidade', calleNumero: 'Rua nº', enviar: 'Enviar', reset: 'Reset' }
  }
  ,
  ru: {
    title: 'Регистрация', choose: 'Выберите язык', privacyTitle: 'Политика конфиденциальности',
    policyHtml: `Пожалуйста, прочитайте нашу Политику конфиденциальности перед началом.`,
    labels: { nombre: 'Имя', telefono: 'Тел', email: 'Эл. почта', cp: 'Индекс', localidad: 'Город', calleNumero: 'Улица №', enviar: 'Отправить', reset: 'Сброс' }
  },
  nl: {
    title: 'Check-in', choose: 'Kies taal', privacyTitle: 'Privacybeleid',
    policyHtml: `Lees ons Privacybeleid voordat u begint.`,
    labels: { nombre: 'Naam', telefono: 'Tel', email: 'E-mail', cp: 'Postcode', localidad: 'Plaats', calleNumero: 'Straat nr', enviar: 'Verzenden', reset: 'Reset' }
  },
  be: {
    title: 'Check-in', choose: 'Kies taal', privacyTitle: 'Privacybeleid',
    policyHtml: `Lees ons Privacybeleid voordat u begint.`,
    labels: { nombre: 'Naam', telefono: 'Tel', email: 'E-mail', cp: 'Postcode', localidad: 'Plaats', calleNumero: 'Straat nr', enviar: 'Verzenden', reset: 'Reset' }
  },
  pl: {
    title: 'Zameldowanie', choose: 'Wybierz język', privacyTitle: 'Polityka prywatności',
    policyHtml: `Proszę przeczytać naszą Politykę prywatności przed rozpoczęciem.`,
    labels: { nombre: 'Imię', telefono: 'Tel', email: 'E-mail', cp: 'Kod poczt.', localidad: 'Miasto', calleNumero: 'Ulica nr', enviar: 'Wyślij', reset: 'Reset' }
  },
  no: {
    title: 'Innsjekk', choose: 'Velg språk', privacyTitle: 'Personvernerklæring',
    policyHtml: `Vennligst les vår personvernpolicy før du begynner.`,
    labels: { nombre: 'Navn', telefono: 'Tlf', email: 'E-post', cp: 'Postnr', localidad: 'Sted', calleNumero: 'Gate nr', enviar: 'Send', reset: 'Tilbakestill' }
  },
  sv: {
    title: 'Incheckning', choose: 'Välj språk', privacyTitle: 'Integritetspolicy',
    policyHtml: `Vänligen läs vår integritetspolicy innan du börjar.`,
    labels: { nombre: 'Namn', telefono: 'Tel', email: 'E-post', cp: 'Postnr', localidad: 'Ort', calleNumero: 'Gata nr', enviar: 'Skicka', reset: 'Återställ' }
  },
  fi: {
    title: 'Sisäänkirjautuminen', choose: 'Valitse kieli', privacyTitle: 'Tietosuojakäytäntö',
    policyHtml: `Lue tietosuojakäytäntömme ennen aloittamista.`,
    labels: { nombre: 'Nimi', telefono: 'Puh', email: 'Sähköposti', cp: 'Postinum.', localidad: 'Kaupunki', calleNumero: 'Katu nro', enviar: 'Lähetä', reset: 'Nollaa' }
  },
  cs: {
    title: 'Přihlášení', choose: 'Vyberte jazyk', privacyTitle: 'Zásady ochrany osobních údajů',
    policyHtml: `Před zahájením si prosím přečtěte naše Zásady ochrany osobních údajů.`,
    labels: { nombre: 'Jméno', telefono: 'Tel', email: 'E-mail', cp: 'PSČ', localidad: 'Město', calleNumero: 'Ulice č.', enviar: 'Odeslat', reset: 'Reset' }
  }
};

const CheckInPage: React.FC = () => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [modalPos, setModalPos] = React.useState<{top: number; left: number} | null>(null);
  const [lang, setLang] = useState<Lang>(() => {
    try { const saved = localStorage.getItem('checkin_lang'); return (saved as Lang) || 'es'; } catch { return 'es'; }
  });
  const [showPolicy, setShowPolicy] = useState(false);

  const t = TRANSLATIONS[lang];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPolicy(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // compute modal center relative to the main content area
  const computeModalPos = React.useCallback(() => {
    try {
      // find the nearest main/app-page-bg ancestor
      const root = rootRef.current;
      if (!root) return null;
      // main element with class app-page-bg is up the tree
      let el: HTMLElement | null = root.closest('main');
      if (!el) el = document.querySelector('main');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { top: rect.top + rect.height / 2, left: rect.left + rect.width / 2 };
    } catch (e) { return null; }
  }, []);

  React.useEffect(() => {
    if (!showPolicy) return;
    const pos = computeModalPos();
    if (pos) setModalPos(pos);
    const onResize = () => { const p = computeModalPos(); if (p) setModalPos(p); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [showPolicy, computeModalPos]);

  React.useEffect(() => {
    try { localStorage.setItem('checkin_lang', lang); } catch { /* ignore */ }
  }, [lang]);

  const POLICY_TEXTS: Record<Lang, string> = {
  es: `Si está realizando el proceso de check-in online, ANLUGA S.A recopila sus datos personales, por ejemplo el localizador de reserva, su nombre o apellidos, según nuestra Política de Privacidad.

Recogemos sus datos para hacer posible el alojamiento en nuestro establecimiento, dejar constancia de su entrada, gestionar su reserva, proporcionarle el servicio de alojamiento turístico y organizar sus posibles pagos.

Si está realizando el proceso de conexión a nuestra wifi, ANLUGA S.A recopila y trata sus datos personales, por ejemplo el nombre o el correo electrónico, según nuestra Política de Privacidad.

Recogemos los datos para garantizar la seguridad de la conexión, gestionar la misma, prevenir ataques y accesos no autorizados y detectar incidentes. También podríamos usar los datos recogidos para enviarle comunicaciones comerciales electrónicas relacionadas con servicios similares a los contratados, variando la base legal en función de si está o no alojado. Para más información sobre este supuesto, consulte nuestra Política de Privacidad.

En cualquier caso, puede contactarnos y ejercer sus derechos de oposición, acceso, rectificación o supresión, entre otros, en lopd@hipotels.com o según establece nuestra Política de Privacidad.
`,
  en: `If you are completing the online check-in process, ANLUGA S.A collects your personal data, for example the reservation reference, your name or surnames, in accordance with our Privacy Policy.

We collect your data to enable accommodation at our establishment, record your arrival, manage your reservation, provide the tourist accommodation service and arrange any payments.

If you are connecting to our Wi‑Fi, ANLUGA S.A collects and processes personal data, for example your name or email address, in accordance with our Privacy Policy.

We collect this information to ensure the security of the connection, manage it, prevent attacks and unauthorized access, and detect incidents. We may also use the collected data to send you electronic commercial communications related to services similar to those contracted, changing the legal basis depending on whether you are staying with us or not. For more information on this scenario, please consult our Privacy Policy.

In any case, you can contact us and exercise your rights of objection, access, rectification or deletion, among others, at lopd@hipotels.com or as established in our Privacy Policy.
`,
  fr: `Si vous effectuez le check-in en ligne, ANLUGA S.A collecte vos données personnelles, par exemple le numéro de réservation, votre nom ou prénom, conformément à notre politique de confidentialité.

Nous collectons vos données pour permettre votre hébergement dans notre établissement, enregistrer votre arrivée, gérer votre réservation, fournir le service d'hébergement touristique et organiser les paiements éventuels.

Si vous vous connectez à notre Wi‑Fi, ANLUGA S.A collecte et traite des données personnelles, par exemple le nom ou l'adresse e-mail, conformément à notre politique de confidentialité.

Nous recueillons ces données pour garantir la sécurité de la connexion, la gérer, prévenir les attaques et les accès non autorisés, et détecter les incidents. Nous pourrions également utiliser les données recueillies pour vous envoyer des communications commerciales électroniques relatives à des services similaires à ceux contractés, en adaptant la base légale selon que vous êtes hébergé ou non. Pour plus d'informations, consultez notre politique de confidentialité.

Dans tous les cas, vous pouvez nous contacter et exercer vos droits d'opposition, d'accès, de rectification ou de suppression, entre autres, à lopd@hipotels.com ou selon ce qui est établi dans notre politique de confidentialité.
`,
  de: `Wenn Sie den Online-Check-in durchführen, erhebt ANLUGA S.A. Ihre personenbezogenen Daten, z. B. die Reservierungsnummer, Ihren Vor- und Nachnamen, gemäß unserer Datenschutzrichtlinie.

Wir erheben Ihre Daten, um die Unterbringung in unserem Haus zu ermöglichen, Ihre Ankunft zu dokumentieren, Ihre Reservierung zu verwalten, den touristischen Beherbergungsdienst zu erbringen und eventuell anfallende Zahlungen zu organisieren.

Wenn Sie sich mit unserem WLAN verbinden, erhebt und verarbeitet ANLUGA S.A. personenbezogene Daten, z. B. Namen oder E-Mail-Adresse, gemäß unserer Datenschutzrichtlinie.

Wir erfassen diese Daten, um die Sicherheit der Verbindung zu gewährleisten, sie zu verwalten, Angriffe und unbefugten Zugriff zu verhindern und Vorfälle zu erkennen. Wir können die gesammelten Daten auch verwenden, um Ihnen elektronische Werbeinformationen zu ähnlichen Dienstleistungen zu senden, wobei die Rechtsgrundlage davon abhängt, ob Sie bei uns übernachten oder nicht. Weitere Informationen hierzu finden Sie in unserer Datenschutzrichtlinie.

Sie können uns jederzeit kontaktieren und Ihre Rechte auf Widerspruch, Auskunft, Berichtigung oder Löschung usw. unter lopd@hipotels.com oder gemäß unserer Datenschutzrichtlinie ausüben.
`,
  it: `Se si sta effettuando il check-in online, ANLUGA S.A raccoglie i suoi dati personali, ad esempio il codice di prenotazione, il nome o il cognome, in conformità con la nostra Informativa sulla privacy.

Raccogliamo i suoi dati per rendere possibile il soggiorno presso la nostra struttura, registrare il suo arrivo, gestire la prenotazione, fornire il servizio di alloggio turistico e organizzare eventuali pagamenti.

Se si sta connettendo alla nostra Wi‑Fi, ANLUGA S.A raccoglie e tratta dati personali, ad esempio il nome o l'indirizzo e-mail, in conformità con la nostra Informativa sulla privacy.

Raccogliamo i dati per garantire la sicurezza della connessione, gestirla, prevenire attacchi e accessi non autorizzati e rilevare incidenti. Potremmo inoltre utilizzare i dati raccolti per inviarle comunicazioni commerciali elettroniche relative a servizi simili a quelli contrattati, variando la base giuridica in base al fatto che sia ospite o meno. Per maggiori informazioni su questo caso, consulti la nostra Informativa sulla privacy.

In ogni caso, può contattarci ed esercitare i suoi diritti di opposizione, accesso, rettifica o cancellazione, tra gli altri, all'indirizzo lopd@hipotels.com o come previsto dalla nostra Informativa sulla privacy.
`,
  pt: `Se estiver a realizar o check-in online, a ANLUGA S.A recolhe os seus dados pessoais, por exemplo o número de reserva, o seu nome ou apelido, de acordo com a nossa Política de Privacidade.

Recolhemos os seus dados para possibilitar a sua estadia no nosso estabelecimento, registar a sua entrada, gerir a sua reserva, fornecer o serviço de alojamento turístico e organizar eventuais pagamentos.

Se estiver a ligar-se à nossa Wi‑Fi, a ANLUGA S.A recolhe e trata dados pessoais, por exemplo o nome ou o e-mail, de acordo com a nossa Política de Privacidade.

Recolhemos os dados para garantir a segurança da ligação, geri‑la, prevenir ataques e acessos não autorizados e detetar incidentes. Poderemos também utilizar os dados recolhidos para lhe enviar comunicações comerciais eletrónicas relacionadas com serviços semelhantes aos contratados, alterando a base legal consoante esteja ou não alojado. Para mais informações sobre este caso, consulte a nossa Política de Privacidade.

Em qualquer caso, pode contactar‑nos e exercer os seus direitos de oposição, acesso, retificação ou eliminação, entre outros, em lopd@hipotels.com ou conforme estabelecido na nossa Política de Privacidade.
`
  ,
  ru: `Если вы проходите онлайн-регистрацию (check-in), ANLUGA S.A собирает ваши персональные данные, например код бронирования, ваше имя и фамилию, в соответствии с нашей Политикой конфиденциальности.

Мы собираем ваши данные, чтобы обеспечить ваше размещение в нашем заведении, зафиксировать ваше прибытие, управлять бронированием, предоставить услугу проживания и организовать возможные платежи.

Если вы подключаетесь к нашей Wi‑Fi, ANLUGA S.A собирает и обрабатывает персональные данные, например имя или адрес электронной почты, в соответствии с нашей Политикой конфиденциальности.

Мы используем эти данные для обеспечения безопасности соединения, его управления, предотвращения атак и несанкционированного доступа, а также обнаружения инцидентов. Мы также можем использовать собранные данные для отправки вам электронных коммерческих сообщений, связанных с услугами, аналогичными заказанным, при этом правовая основа может различаться в зависимости от того, являетесь ли вы гостем или нет. Для получения дополнительной информации смотрите нашу Политику конфиденциальности.

В любом случае вы можете связаться с нами и реализовать свои права на возражение, доступ, исправление или удаление и другие, написав на lopd@hipotels.com или в порядке, предусмотренном нашей Политикой конфиденциальности.
`,
  nl: `Als u de online check-in uitvoert, verzamelt ANLUGA S.A uw persoonsgegevens, bijvoorbeeld het reserveringsnummer, uw naam of achternaam, in overeenstemming met ons Privacybeleid.

We verzamelen uw gegevens om verblijf in onze accommodatie mogelijk te maken, uw aankomst vast te leggen, uw reservering te beheren, de toeristische accommodatie te leveren en eventuele betalingen te regelen.

Als u verbinding maakt met onze Wi‑Fi, verzamelt en verwerkt ANLUGA S.A persoonsgegevens, zoals naam of e‑mailadres, in overeenstemming met ons Privacybeleid.

We gebruiken deze gegevens om de veiligheid van de verbinding te waarborgen, deze te beheren, aanvallen en ongeautoriseerde toegang te voorkomen en incidenten te detecteren. We kunnen de verzamelde gegevens ook gebruiken om u elektronische commerciële communicatie te sturen met betrekking tot diensten die vergelijkbaar zijn met de afgenomen diensten. Raadpleeg ons Privacybeleid voor meer informatie.

In elk geval kunt u contact met ons opnemen en uw rechten op bezwaar, toegang, rectificatie of wissing uitoefenen via lopd@hipotels.com of zoals vastgelegd in ons Privacybeleid.
`,
  be: `Als u de online check-in uitvoert, verzamelt ANLUGA S.A uw persoonsgegevens, bijvoorbeeld het reserveringsnummer, uw naam of achternaam, in overeenstemming met ons Privacybeleid.

We verzamelen uw gegevens om uw verblijf in onze accommodatie mogelijk te maken, uw aankomst te registreren, uw reservering te beheren, de toeristische accommodatie te leveren en eventuele betalingen te regelen.

Als u verbinding maakt met onze Wi‑Fi, verzamelt en verwerkt ANLUGA S.A persoonsgegevens, zoals naam of e‑mail, in overeenstemming met ons Privacybeleid.

We gebruiken deze gegevens om de veiligheid van de verbinding te waarborgen, deze te beheren, aanvallen en ongeautoriseerde toegang te voorkomen en incidenten te detecteren. We kunnen de verzamelde gegevens ook gebruiken om u elektronische commerciële communicatie te sturen met betrekking tot soortgelijke diensten. Raadpleeg ons Privacybeleid voor meer informatie.

In elk geval kunt u contact met ons opnemen en uw rechten op bezwaar, toegang, rectificatie of wissing uitoefenen via lopd@hipotels.com of zoals vastgelegd in ons Privacybeleid.
`,
  pl: `Jeżeli dokonują Państwo odprawy online (check-in), ANLUGA S.A gromadzi Państwa dane osobowe, na przykład numer rezerwacji, imię i nazwisko, zgodnie z naszą Polityką prywatności.

Gromadzimy dane w celu umożliwienia pobytu w naszym obiekcie, potwierdzenia Państwa przyjazdu, obsługi rezerwacji, świadczenia usługi noclegowej oraz organizacji ewentualnych płatności.

Jeżeli łączą się Państwo z naszą siecią Wi‑Fi, ANLUGA S.A zbiera i przetwarza dane osobowe, na przykład imię lub adres e‑mail, zgodnie z naszą Polityką prywatności.

Wykorzystujemy te dane w celu zapewnienia bezpieczeństwa połączenia, jego zarządzania, zapobiegania atakom i nieautoryzowanemu dostępowi oraz wykrywania incydentów. Możemy również wykorzystać zebrane dane do wysyłania Państwu elektronicznych komunikatów handlowych dotyczących usług podobnych do zamówionych; podstawa prawna może się różnić w zależności od tego, czy są Państwo gośćmi czy nie. Więcej informacji znajduje się w naszej Polityce prywatności.

W każdym przypadku mogą Państwo się z nami skontaktować i egzekwować swoje prawa do sprzeciwu, dostępu, sprostowania lub usunięcia danych, pisząc na lopd@hipotels.com lub zgodnie z postanowieniami naszej Polityki prywatności.
`,
  no: `Hvis du utfører online innsjekk, samler ANLUGA S.A inn personopplysningene dine, for eksempel reservasjonsreferansen, ditt navn eller etternavn, i samsvar med vår personvernerklæring.

Vi samler inn dataene dine for å muliggjøre overnatting på vårt anlegg, registrere ankomsten din, administrere reservasjonen din, tilby overnattings­tjenesten og organisere eventuelle betalinger.

Hvis du kobler til vårt Wi‑Fi, samler og behandler ANLUGA S.A personopplysninger, for eksempel navn eller e‑postadresse, i samsvar med vår personvernerklæring.

Vi bruker disse opplysningene for å sikre forbindelsens sikkerhet, administrere den, forhindre angrep og uautorisert tilgang og oppdage hendelser. Vi kan også bruke de innhentede opplysningene til å sende deg elektroniske kommersielle meldinger relatert til tjenester som ligner på de bestilte. For mer informasjon, se vår personvernerklæring.

Uansett kan du kontakte oss og utøve dine rettigheter til innsigelse, innsyn, retting eller sletting m.m. på lopd@hipotels.com eller i samsvar med vår personvernerklæring.
`,
  sv: `Om du genomför online-incheckningen samlar ANLUGA S.A in dina personuppgifter, till exempel bokningsreferensen, ditt för‑ och efternamn, i enlighet med vår integritetspolicy.

Vi samlar in dina uppgifter för att möjliggöra boende på vår anläggning, dokumentera din ankomst, hantera din bokning, tillhandahålla övernattningstjänsten och organisera eventuella betalningar.

Om du ansluter till vårt Wi‑Fi samlar ANLUGA S.A in och behandlar personuppgifter, till exempel namn eller e‑postadress, i enlighet med vår integritetspolicy.

Vi använder dessa uppgifter för att säkerställa anslutningens säkerhet, hantera den, förebygga attacker och obehörig åtkomst samt upptäcka incidenter. Vi kan också använda de insamlade uppgifterna för att skicka dig elektroniska kommersiella meddelanden relaterade till tjänster liknande de som beställts. För mer information, se vår integritetspolicy.

I vilket fall kan du kontakta oss och utöva dina rättigheter till erinran, åtkomst, rättelse eller radering m.m. via lopd@hipotels.com eller enligt vad som anges i vår integritetspolicy.
`,
  fi: `Jos suoritat online‑sisäänkirjautumisen, ANLUGA S.A kerää henkilötietojasi, esimerkiksi varausviitteen, nimesi tai sukunimesi, tietosuojakäytäntömme mukaisesti.

Keräämme tietoja mahdollistaaksemme majoituksen tiloissamme, kirjata saapumisesi, käsitellä varauksesi, tarjota majoituspalvelun ja järjestää mahdolliset maksut.

Jos yhdistät laitteesi Wi‑Fi‑verkkoomme, ANLUGA S.A kerää ja käsittelee henkilötietoja, esimerkiksi nimeä tai sähköpostiosoitetta, tietosuojakäytäntömme mukaisesti.

Käytämme näitä tietoja yhteyden turvallisuuden varmistamiseen, sen hallintaan, hyökkäysten ja luvattoman käytön estämiseen sekä tapahtumien havaitsemiseen. Saatamme myös käyttää kerättyjä tietoja lähettääksemme sinulle sähköisiä kaupallisia viestejä, jotka liittyvät vastaaviin palveluihin kuin tilatut; oikeusperuste voi vaihdella sen mukaan, oletteko majoittuja vai ette. Lisätietoja löytyy tietosuojakäytännöstämme.

Joka tapauksessa voit ottaa meihin yhteyttä ja käyttää oikeuksiasi vastustaa, saada pääsy, oikaista tai poistaa tietoja ym. osoitteessa lopd@hipotels.com tai tietosuojakäytäntömme mukaisesti.
`,
  cs: `Pokud provádíte online check‑in, ANLUGA S.A shromažďuje vaše osobní údaje, například referenční číslo rezervace, vaše jméno nebo příjmení, v souladu s naší Zásadou ochrany osobních údajů.

Sbíráme vaše údaje, abychom umožnili ubytování v našem zařízení, zaznamenali váš příjezd, spravovali vaši rezervaci, poskytli službu ubytování a zajistili případné platby.

Pokud se připojujete k naší Wi‑Fi, ANLUGA S.A shromažďuje a zpracovává osobní údaje, například jméno nebo e‑mailovou adresu, v souladu s naší Zásadou ochrany osobních údajů.

Používáme tyto údaje k zajištění bezpečnosti připojení, jeho správě, prevenci útoků a neoprávněného přístupu a k detekci incidentů. Můžeme také použít shromážděné údaje k zasílání elektronických obchodních sdělení souvisejících se službami podobnými těm, které jste si objednali. Další informace naleznete v naší Zásadě ochrany osobních údajů.

V každém případě nás můžete kontaktovat a uplatnit svá práva na námitku, přístup, opravu nebo výmaz atd. na lopd@hipotels.com nebo v souladu s naší Zásadou ochrany osobních údajů.
`
  };

  return (
  <div ref={rootRef} className="min-h-screen w-full flex flex-col items-center justify-between px-4 bg-fixed" style={{ backgroundImage: "url('/assets/checkin-top-new.jpg')", backgroundSize: 'cover', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', paddingTop: '6vh' }}>
  {/* spacer arriba aumentado a 12vh para bajar el cuadro de idiomas */}
  <div aria-hidden style={{ height: '12vh', width: '100%' }} />

      {/* Logo centrado en la parte superior */}
      <div className="w-full flex justify-center items-start pointer-events-none" style={{ marginTop: 'calc(-14vh - 3vh)' }}>
        <img
          src="/assets/logo checkin.png"
          alt="Hipotels"
          className="h-24 md:h-32 lg:h-40 object-contain"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.28))' }}
        />
      </div>

      {/* Group languages, form and policy with consistent gap so spacing between elements is equal */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-3">
        {/* Languages row */}
        <div className="w-full panel-opaque rounded-lg shadow p-3">
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-2" style={{ maxWidth: '100%', rowGap: '6px' }}>
              {Object.keys(LANGUAGE_FLAGS).map((k) => (
                <button
                  key={k}
                  onClick={() => setLang(k as Lang)}
                  aria-label={k}
                  className={`w-10 h-10 flex items-center justify-center text-lg text-white bg-teal-500 rounded-md ${lang===k ? 'ring-2 ring-offset-2' : ''}`}>
                  {LANGUAGE_FLAGS[k as Lang]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form area */}
        <main className="w-full panel-opaque rounded-lg shadow p-4 md:p-6">
          <div className="mb-3 text-center text-sm text-gray-600 dark:text-gray-300">{t.title}</div>
          <CheckInForm labels={t.labels} />
        </main>

        {/* Privacy policy at bottom - placed with same gap as above */}
        <footer className="w-full flex justify-center" style={{ marginBottom: '3vh' }}>
          <div className="w-full panel-opaque rounded-lg shadow p-3 md:p-4 text-sm text-center">
            <h3 className="font-semibold mb-1">{t.privacyTitle}</h3>
            <p className="mb-2 text-gray-700 dark:text-gray-200">{t.policyHtml}</p>
            <div className="flex justify-center">
              <button onClick={() => setShowPolicy(true)} className="px-4 py-2 bg-hipo-blue text-white rounded">Ver política</button>
            </div>
          </div>
        </footer>
      </div>

      {showPolicy && (
        <>
          {/* overlay covers entire viewport with 80% black (darker when policy modal is open) */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPolicy(false)} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
          {/* modal centered relative to main content area */}
          <div className="fixed z-50 p-4" style={modalPos ? { top: modalPos.top + 'px', left: modalPos.left + 'px', transform: 'translate(-50%,-50%)' } : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <div role="dialog" aria-modal="true" className="panel-solid w-full max-w-3xl rounded shadow-lg">
                <div className="p-6 max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-100">
                  <h2 className="text-lg font-semibold mb-4">{t.privacyTitle}</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ lineHeight: 1.6 }}>{POLICY_TEXTS[lang]}</div>
                </div>
                <div className="p-4 border-t flex justify-end">
                  <button onClick={() => setShowPolicy(false)} className="px-4 py-2 rounded border">Cerrar</button>
                </div>
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckInPage;
