package com.hipo.suite;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;
import com.hipo.suite.smb.SmbWriter;

public class MainActivity extends BridgeActivity {
	@Override
	public void onStart() {
		super.onStart();
		// register native plugin explicitly in case automatic scan fails
		try { this.registerPlugin(SmbWriter.class); } catch(Exception e) { /* ignore */ }
	}
}
