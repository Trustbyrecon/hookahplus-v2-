<<<<<<< HEAD
# Hookahplus

Hookahplus aggregates several repositories for the Hookah+ project using Git submodules. Currently only the `netlify` site is linked as a submodule so it remains a separate repo while sharing a common root.

## Initializing Submodules
After cloning this repository, pull in the linked modules with:

```bash
git submodule update --init --recursive
```

This command fetches the `netlify` submodule and checks out the appropriate commit.

## Command Dispatcher
Utility tasks can be run via `cmd_dispatcher.py`. Invoke it with a command name to call the corresponding helper in `cmd/modules/reflex_ui.py`:

```bash
python cmd_dispatcher.py <command>
```

Available commands:
- `deployReflexUI` – trigger a Netlify deploy
- `renderReflexLoyalty <user_id>` – generate a loyalty heatmap for the given user
- `injectReflexHeatmap` – insert the heatmap into the dashboard
- `fireSession` – launch a simulated session with QR tracking and dynamic pricing

More commands can be added by extending `cmd/modules/reflex_ui.py` and updating the `COMMANDS` table in `cmd_dispatcher.py`.
=======
# Hookah+ Launch App

This is a baseline restore template for Hookah+ full launch.

- Next.js App Router and Pages Router included
- Placeholder flavor selector UI
- Ready to deploy
>>>>>>> 1720e30bee34ab738cfd08a47b42d87217c4be27
