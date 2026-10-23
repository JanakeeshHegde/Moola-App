# MOOLA Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @org.springframework.** *;
}
-keep class com.moola.app.data.model.** { *; }
