import React, { useState } from "react";
import styles from "../../../src/style/style.ts";
import UsersApi from "../../../services/UsersApi";
import TeamsApi from "../../../services/TeamsApi";

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function RapportsEtStatistiques({ token }) {
  const [loading, setLoading] = useState(false);

  const handleExportMonthlyReport = async () => {
    try {
      setLoading(true);
      const [users, teams] = await Promise.all([
        UsersApi.list({ token }),
        TeamsApi.list({ token })
      ]);

      const teamById = new Map((teams || []).map((t) => [t.team_id, t]));

      const header = [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "role",
        "team_id",
        "team_name"
      ].join(",");

      const lines = (users || []).map((u) => {
        const team = u.teamId ? teamById.get(u.teamId) : null;
        return [
          csvEscape(u.userId ?? ""),
          csvEscape(u.firstName ?? ""),
          csvEscape(u.lastName ?? ""),
          csvEscape(u.email ?? ""),
          csvEscape(u.role ?? ""),
          csvEscape(u.teamId ?? ""),
          csvEscape(team?.name ?? "")
        ].join(",");
      });

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      downloadTextFile(`rapport-mensuel-${y}-${m}.csv`, [header, ...lines].join("\n"), "text/csv");
    } catch (err) {
      alert(err?.message || "Erreur export");
    } finally {
      setLoading(false);
    }
  };

  const notImplemented = () => {
    alert("Fonctionnalité à connecter côté backend (endpoint manquant)");
  };

  return (
    <div style={styles.dashboard.main}>
      <div style={styles.dashboard.contentContainer}>
        <div style={{ padding: "24px" }}>
          <h2 style={styles.profile.title}>Rapports et statistiques</h2>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px"
            }}
          >
            <div style={styles.profile.infoCard}>
              <div style={styles.profile.infoTitle}>Taux de retard mensuel</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[{ month: "Janvier 2024", pct: 12 }, { month: "Décembre 2023", pct: 8 }, { month: "Novembre 2023", pct: 5 }].map((row) => (
                  <div key={row.month}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#475569" }}>{row.month}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: row.pct >= 10 ? "#dc2626" : row.pct >= 7 ? "#f59e0b" : "#10b981" }}>
                        {row.pct}%
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(row.pct, 100)}%`,
                          height: "100%",
                          background: row.pct >= 10 ? "#f97316" : row.pct >= 7 ? "#f59e0b" : "#10b981"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.profile.infoCard}>
              <div style={styles.profile.infoTitle}>Heures supplémentaires</div>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#4f46e5" }}>127h</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "18px" }}>Ce mois-ci</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "60px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>89h</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Mois dernier</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>156h</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Moyenne</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.profile.infoCard}>
            <div style={styles.profile.infoTitle}>Actions rapides</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              <button style={styles.dashboard.editProfileBtn} onClick={handleExportMonthlyReport} disabled={loading}>
                {loading ? "⏳ Export..." : "📊 Exporter rapport mensuel"}
              </button>
              <button style={styles.profile.saveBtn} onClick={notImplemented}>
                📧 Envoyer alertes retards
              </button>
              <button style={styles.login.loginButton} onClick={notImplemented}>
                📈 Générer statistiques
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
