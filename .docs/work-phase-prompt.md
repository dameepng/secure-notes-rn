# Prompt: `/work-phase` — Eksekusi PRD SecureNotes Per-Fase

## Cara Pake

**Kalau lo pake Claude Code** (sesuai workflow `/prd-create`, `/work-issue-tdd` yang udah lo pake di project Android):
1. Simpen isi di bawah "PROMPT TEMPLATE" ke `.claude/commands/work-phase.md` di root repo `secure-notes-rn`
2. Pastiin PRD (`prd-securenotes-rn-newarch.md`) ada di root repo juga
3. Jalanin di Claude Code: `/work-phase 0` (ganti angka sesuai fase yang mau dikerjain)

**Kalau lo pake agent lain** (Cursor, Windsurf, dll): copy isi "PROMPT TEMPLATE", ganti `$ARGUMENTS` manual jadi nomor fase, paste langsung sebagai prompt.

**Prasyarat:**
- `gh` CLI udah ke-install dan authenticated (`gh auth login`)
- Repo udah ke-push ke `origin/main` (udah lo lakuin)
- PRD file ada di repo, accessible sama agent

---

## PROMPT TEMPLATE

```markdown
Kamu adalah engineer yang mengerjakan project React Native "SecureNotes" berdasarkan PRD di file `prd-securenotes-rn-newarch.md`.

Tugas kamu: implementasikan **Fase $ARGUMENTS** dari PRD tersebut — DAN HANYA fase itu. Jangan mengerjakan fase lain, jangan "mencicil" fase berikutnya walau kelihatan terkait.

## Alur Kerja Wajib

1. **Baca PRD dulu**, cari section fase yang dimaksud, catat: Tujuan, Tugas konkret, Deliverable, Acceptance Criteria.

2. **Sync branch main:**
   ```
   git checkout main
   git pull origin main
   ```

3. **Buat branch baru** dengan format `phase-$ARGUMENTS-<slug-singkat-nama-fase>`, contoh: `phase-0-setup-verify-newarch`, `phase-5-crypto-encryption`.
   ```
   git checkout -b phase-$ARGUMENTS-<slug>
   ```

4. **Implementasikan HANYA tugas-tugas yang tercantum di fase itu.** Kalau nemu ambiguitas di PRD (misal detail teknis yang gak dijelasin), STOP dan tanya ke saya dulu — jangan asal nebak/asumsi implementasi.

5. **Cek Acceptance Criteria fase itu sendiri** sebelum lanjut ke commit. Kalau ada acceptance criteria yang butuh manual testing (misal cek di device fisik), tulis catatan di PR description bagian mana yang perlu saya test manual.

6. **Commit dengan conventional commits**, granular per langkah logis (jangan 1 commit raksasa), contoh:
   ```
   feat(phase-0): init RN 0.81.1 project with New Architecture enabled
   chore(phase-0): verify Fabric/TurboModule active in startup log
   ```

7. **Push branch:**
   ```
   git push -u origin phase-$ARGUMENTS-<slug>
   ```

8. **Buat Pull Request ke `main`** pakai `gh pr create`, JANGAN merge:
   ```
   gh pr create \
     --base main \
     --head phase-$ARGUMENTS-<slug> \
     --title "Phase $ARGUMENTS: <nama fase dari PRD>" \
     --body "..."
   ```

   Isi PR body wajib mencakup:
   - **Ringkasan** apa yang dikerjain di fase ini
   - **Checklist Acceptance Criteria** dari PRD (checked/unchecked, jujur — jangan centang kalau belum diverifikasi)
   - **Yang perlu direview manual** oleh saya (kalau ada, misal test di device fisik, cek visual UI)
   - **Konsep yang dipelajari** di fase ini (ringkas 2-3 baris, biar PR ini juga jadi catatan belajar)

9. **JANGAN PERNAH:**
   - Merge PR sendiri (`gh pr merge`) — ini keputusan saya setelah review
   - Push langsung ke `main`
   - Force push ke branch manapun tanpa saya minta
   - Menghapus/mengubah kode dari fase-fase sebelumnya yang udah di-merge, kecuali itu emang bagian dari tugas fase ini

10. **Setelah PR dibuat**, laporkan ke saya: link PR-nya, ringkasan singkat apa yang dikerjain, dan status acceptance criteria mana yang udah pasti lolos vs mana yang perlu saya cek manual. Berhenti di situ — tunggu saya review dan kasih instruksi lanjut (approve/revisi).
```

---

## Catatan Tambahan

- Kalau di tengah fase agent nemu bug/masalah dari fase sebelumnya (yang udah di-merge), jangan langsung diperbaiki di branch fase ini — laporin dulu ke lo, biar lo yang putusin mau di-branch terpisah atau digabung ke fase sekarang.
- Kalau 1 fase kerasa kebesaran buat 1 PR (misal Fase 7 — native module, ada Android + iOS side), lo bisa pecah manual jadi `phase-7a-android`, `phase-7b-ios` — tinggal sebut itu pas manggil promptnya.
- Base branch di atas diasumsikan `main` (sesuai `git push -u origin main` yang udah lo jalanin). Kalau nanti lo pake branch protection rules, PR ini juga otomatis kena review requirement itu.
