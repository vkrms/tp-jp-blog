short commit messages, angular style
don't push or deploy unless asked
confirm changes with playwright mcp or browser mcp only if asked to
don't run mcp check on every change
call the update agent "updater" everywhere (never обновлятор / апдейтер); after importing files from the content owner's handoff run `npm run terms:fix` (`npm run check` and the PR check fail otherwise)
after importing the content owner's content/rules.json, keep the two developer-added excluded_topics patterns (PR表示…, 提携解除…; see commit 61af980)
in content/rules.json keep seo.slug_pattern with (?!en$): slug "en" is reserved because EN pages live at <page>/en/
