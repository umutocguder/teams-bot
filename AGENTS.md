# Teams Bot — Development & Architectural Guidelines

Bu doküman, **Teams Bot** projesinin mimari standartlarını, kurallarını ve geliştirme süreçlerini belirler.

---

## 1. Proje Kimliği ve Amacı
- **Proje Adı**: Teams Bot
- **Amaç**: Microsoft Teams toplantılarını ve mesajlarını otomatikleştiren, durum güncellemelerini takip eden akıllı bot çözümü.
- **Geliştirici**: Umut Öçgüder <umutocgdr@gmail.com> / 11Hopem
- **Logo**: `assets/logo.svg`

---

## 2. Mimari ve Teknoloji Yığını
- **Çalışma Ortamı**: Node.js, TypeScript
- **Telemetri**: Dual-tier `src/telemetry.ts` (Yerel JSONL + Firebase `hopem-software-cloud`)
- **Telif**: `Created by 11Hopem`

---

## 3. Test ve Çalıştırma
- **Testleri Çalıştırma**: `npm test`

---

## Git Branch Model — `master` = production, `dev` = UAT  (MANDATORY)

Set by Umut on 2026-10-15. **This overrides any earlier branch or tagging
instruction in this file**, including "auto-bump and tag on every push".

| Branch | Meaning | Rule |
|---|---|---|
| `master` | **Production** — what is live / shipped right now | Never commit directly. Only released code is merged in. |
| `dev` | **UAT** — where development happens; always ahead of or equal to `master` | All work lands here. |

The branch name `main` is not used.

**The agent manages branch switching, commits, merges and tags itself — it does
not ask Umut which branch to work on.**

1. A code change is requested → if on `master`, **switch to `dev` immediately**.
   The change and the commit go to `dev`.
2. Builds and packages are produced from `dev`.
3. The moment it goes live — App Store approval, Vercel production, delivery to
   the client — merge `dev` into `master`.
4. Tag on `master`: `v<version>` (e.g. `v1.0`, `v1.1`). **A tag is only ever
   created for a version that actually shipped.** Never tag on every push.
5. Development continues on `dev`. After the merge, `dev` and `master` are equal.

If a merge conflict appears, stop and tell Umut — do not resolve it alone.

Full rule: `/Users/umut/ai-context/kurallar/git-dal-modeli-master-dev.md`
