"use client";

/**
 * User Preferences Page
 * Settings for theme, notifications, etc.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Moon, Sun, Bell, Clock } from "lucide-react";

export default function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [timeFormat24h, setTimeFormat24h] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load preferences from localStorage
    const saved = localStorage.getItem("user-preferences");
    if (saved) {
      const prefs = JSON.parse(saved);
      setDarkMode(prefs.darkMode ?? false);
      setEmailNotifications(prefs.emailNotifications ?? true);
      setPushNotifications(prefs.pushNotifications ?? true);
      setTimeFormat24h(prefs.timeFormat24h ?? true);
    }
  }, []);

  const handleSavePreferences = () => {
    const preferences = {
      darkMode,
      emailNotifications,
      pushNotifications,
      timeFormat24h,
    };
    localStorage.setItem("user-preferences", JSON.stringify(preferences));

    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    toast.success("Preferências salvas com sucesso");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferências</h1>
        <p className="text-gray-600">Personalize sua experiência na Carolina</p>
      </div>

      {/* Theme Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Aparência</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium">Modo Escuro</p>
                <p className="text-sm text-gray-600">
                  {darkMode ? "Ativado" : "Desativado"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Notificações</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Notificações Push</p>
                <p className="text-sm text-gray-600">
                  {pushNotifications ? "Ativadas" : "Desativadas"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                pushNotifications ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  pushNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Notificações por Email</p>
                <p className="text-sm text-gray-600">
                  {emailNotifications ? "Ativadas" : "Desativadas"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                emailNotifications ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Time Format */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Formato de Hora</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Formato 24h</p>
                <p className="text-sm text-gray-600">
                  {timeFormat24h ? "Ativado (23:45)" : "Desativado (11:45 PM)"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTimeFormat24h(!timeFormat24h)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                timeFormat24h ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  timeFormat24h ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button onClick={handleSavePreferences}>Salvar Preferências</Button>
      </div>
    </div>
  );
}
