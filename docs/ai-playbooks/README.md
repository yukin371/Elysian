# AI Playbooks

给 AI（Claude Code / Codex）执行任务时使用的剧本模板。

## 文档列表

- [task-input-template.md](./task-input-template.md)
- [task-output-template.md](./task-output-template.md)
- [incident-recovery-template.md](./incident-recovery-template.md)
- [p5a-input-template.md](./p5a-input-template.md)
- [p5a-output-contract.md](./p5a-output-contract.md)
- [p5a-acceptance-corpus.md](./p5a-acceptance-corpus.md)

## 规则

- Playbook 只定义执行协议，不定义业务事实。
- 与 CLI 参数不一致时，以 CLI 实现为准并及时同步文档。
- `P5A` 相关 playbook 以当前 `ModuleSchema` 最小契约为边界，不把权限、菜单、流程、运行时集成直接塞进 generator handoff 文件。
