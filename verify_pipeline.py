"""
verify_pipeline.py (FRONTEND)
==============================
Script de verification automatique a executer apres le merge
du collegue sur la branche main (wagan-front).

Usage :
    python verify_pipeline.py
"""

import subprocess
import sys
import os

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

OK   = f"{GREEN}[OK]{RESET}"
FAIL = f"{RED}[FAIL]{RESET}"
WARN = f"{YELLOW}[WARN]{RESET}"

errors   = []
warnings = []

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode

def check(label, condition, fatal=True):
    if condition:
        print(f"  {OK}  {label}")
    else:
        print(f"  {FAIL}  {label}")
        if fatal:
            errors.append(label)
        else:
            warnings.append(label)

def file_contains(filepath, *patterns):
    try:
        with open(filepath, encoding="utf-8", errors="ignore") as fh:
            content = fh.read()
        return all(p in content for p in patterns)
    except FileNotFoundError:
        return False

print(f"\n{BOLD}{'='*60}{RESET}")
print(f"{BOLD}  WAGAN FRONT - Verification Integrite Pipeline Post-Merge{RESET}")
print(f"{BOLD}{'='*60}{RESET}\n")

# 1. GIT
print(f"{BOLD}[1/5] Verification Git{RESET}")
tag_out, _ = run("git tag -l v1.0-poc-chrys")
check("Tag de reference v1.0-poc-chrys present", bool(tag_out))

diff_out, _ = run("git diff v1.0-poc-chrys HEAD -- src/")
if diff_out:
    print(f"  {WARN}  Differences dans src/ depuis le tag - lancez :")
    print(f"         git diff v1.0-poc-chrys HEAD -- src/")
    warnings.append("Differences dans src/ (verifier manuellement)")
else:
    print(f"  {OK}  Aucune difference dans src/ depuis le tag")
print()

# 2. FICHIERS CRITIQUES
print(f"{BOLD}[2/5] Presence des fichiers critiques{RESET}")
CRITICAL_FILES = [
    "src/page/auth/Login.tsx",
    "src/page/auth/Register.tsx",
    "src/page/auth/authSlice.ts",
    "src/page/admin/AdminDashboard.tsx",
    "src/page/admin/UsersList.tsx",
    "src/page/admin/BotConfigPanel.tsx",
    "src/page/admin/HotLeadsList.tsx",
    "src/page/chat/chatSlice.tsx",
    "src/config/api.ts",
    "src/component/auth/RequireAdmin.tsx",
    "src/component/auth/RequireAuth.tsx",
    "vite.config.ts",
    "package.json",
    ".env.example",
]
for f in CRITICAL_FILES:
    check(f, os.path.isfile(f))
print()

# 3. LOGIQUE CLES
print(f"{BOLD}[3/5] Logique cle dans le code{RESET}")
check("apiUrl() presente dans api.ts",
      file_contains("src/config/api.ts", "apiUrl"))
check("authHeader() presente dans api.ts",
      file_contains("src/config/api.ts", "authHeader"))
check("DeleteUserView appelee dans UsersList",
      file_contains("src/page/admin/UsersList.tsx", "delete"))
check("Popconfirm de suppression dans UsersList",
      file_contains("src/page/admin/UsersList.tsx", "Supprimer cet utilisateur"))
check("JWT token dans authSlice",
      file_contains("src/page/auth/authSlice.ts", "access"))
check("RequireAdmin protege les routes admin",
      file_contains("src/component/auth/RequireAdmin.tsx", "isAdmin"))
check("BotConfigPanel - sauvegarde config",
      file_contains("src/page/admin/BotConfigPanel.tsx", "PUT") or
      file_contains("src/page/admin/BotConfigPanel.tsx", "put"))
check("HotLeadsList - liste hot leads",
      file_contains("src/page/admin/HotLeadsList.tsx", "hot_leads"))
check("VITE_API_URL dans .env.example",
      file_contains(".env.example", "VITE_API_URL"))
print()

# 4. SECURITE
print(f"{BOLD}[4/5] Securite{RESET}")
tracked_env = subprocess.run("git ls-files .env", shell=True, capture_output=True, text=True).stdout.strip()
check(".env absent du depot git", not bool(tracked_env))
check(".gitignore contient .env",
      file_contains(".gitignore", ".env"))
check("dist/ ignore dans .gitignore",
      file_contains(".gitignore", "dist"))
print()

# 5. DEPENDANCES
print(f"{BOLD}[5/5] Dependances package.json{RESET}")
check("react-router-dom present (et non react-router en double)",
      file_contains("package.json", "react-router-dom") and
      not file_contains("package.json", '"react-router":'))
check("antd present (composants UI)",
      file_contains("package.json", '"antd"'))
check("@reduxjs/toolkit present (state management)",
      file_contains("package.json", "@reduxjs/toolkit"))
check("vite present (bundler)",
      file_contains("package.json", '"vite"'))
print()

# RAPPORT FINAL
print(f"{BOLD}{'='*60}{RESET}")
if not errors and not warnings:
    print(f"{GREEN}{BOLD}  PIPELINE FRONT INTACT - Aucun probleme detecte.{RESET}")
elif not errors:
    print(f"{YELLOW}{BOLD}  PIPELINE FRONT OK avec {len(warnings)} avertissement(s).{RESET}")
    for w in warnings:
        print(f"    {WARN} {w}")
else:
    print(f"{RED}{BOLD}  ATTENTION - {len(errors)} probleme(s) critique(s) !{RESET}")
    for e in errors:
        print(f"    {FAIL} {e}")
    if warnings:
        for w in warnings:
            print(f"    {WARN} {w}")
print(f"{BOLD}{'='*60}{RESET}\n")
sys.exit(1 if errors else 0)
