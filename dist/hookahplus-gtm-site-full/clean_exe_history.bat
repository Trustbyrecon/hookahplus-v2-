@echo off
echo == Step 1: Cloning git-filter-repo if missing ==
if not exist "git-filter-repo" (
    git clone https://github.com/newren/git-filter-repo.git
)

echo == Step 2: Adding git-filter-repo to PATH ==
set PATH=%CD%\git-filter-repo;%PATH%

echo == Step 3: Cleaning .exe files from Git history ==
git filter-repo --path-glob '*.exe' --invert-paths

echo == Step 4: Force pushing to GitHub ==
git push --force

echo == All done! .exe files removed from history and repo pushed ==
pause
