Local Java versions and emulator notes

Problem
-------
CI uses Temurin JDK 21 by default. Your local macOS may have set Gradle to use a specific JDK path (e.g., Temurin 21). That path is invalid on CI and causes Gradle to fail with:

  Value '/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home' given for org.gradle.java.home Gradle property is invalid

Recommended workflow
--------------------
- Do not hardcode org.gradle.java.home in `android/gradle.properties` (we removed it).
- CI sets Java with `actions/setup-java@v4` (java-version: 21) and exports JAVA_HOME. Gradle uses that by default.
- For local testing of the Android emulator (which may require Java 17), either:
  1) Install a JDK 17 and set your shell's JAVA_HOME before running the emulator/Gradle; or
  2) Use the helper script `scripts/set-java-for-emulator.sh` to quickly set JAVA_HOME in your shell:

     source scripts/set-java-for-emulator.sh /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

- To reset to system default, either close the shell or set JAVA_HOME back to your preferred JDK path.

Optional: per-project override
-----------------------------
If you need a per-project override, create a local-only `android/gradle-local.properties` (gitignored) and set:

  org.gradle.java.home=/path/to/your/local/jdk

This keeps CI unaffected.

If you want me to add a small `Makefile` or npm script to automate switching JAVA versions locally, tell me and I will add it.
