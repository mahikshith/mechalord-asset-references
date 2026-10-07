# Claude Code skills and plugins for this project

Installed 7 October 2026 on the user's Windows machine (user scope, so they apply to every Claude Code session).

| Source | Installed as | What it gives | How to use |
|---|---|---|---|
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Plugin `ponytail@ponytail` (marketplace `ponytail`) | Terse "lazy senior dev" mode that cuts token use and over-engineering. Hooks load it at session start. | Automatic. Skills: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`. |
| [MonumentalSystems/Atlas-Agent-Teams](https://github.com/MonumentalSystems/Atlas-Agent-Teams/tree/main/teams/game-dev) | Plugin `game-dev@atlas-agents` (marketplace `atlas-agents`) | Game-dev agent team (engine, gameplay, level design, asset pipeline, QA) with Three.js/Unity/Unreal/Godot skills. Logs tool use locally to JSONL. | `/game-dev:gamedev <task>` (the command file is `gamedev`, not `game`), `/game-dev:status`. |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills/blob/main/SKILLS_GUIDE.md) "Frontend & Mobile" section only | Personal skills in `~/.claude/skills` | `react-expert`, `nextjs-developer`, `vue-expert`, `vue-expert-js`, `angular-architect`, `react-native-expert`, `flutter-expert`. | Load by name when doing mobile wrapper / UI work. |
| [emalorenzo/three-agent-skills](https://github.com/emalorenzo/three-agent-skills) | Personal skills in `~/.claude/skills` | `three-best-practices`, `r3f-best-practices` (Three.js performance and rendering rules). | Load before touching the Three.js renderer in `tools/playable-preview`. |

Reinstall on another machine:

```bash
claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
claude plugin marketplace add MonumentalSystems/Atlas-Agent-Teams && claude plugin install game-dev@atlas-agents
```

Then copy the skill folders listed above from each repo's `skills/` directory into `~/.claude/skills/`.
