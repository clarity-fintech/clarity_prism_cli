import { Command } from "commander";
import { SkillAgent, resolveSkillName } from "@clrt/skills-sdk";
import { listSkills } from "@clrt/skill-marketplace";
import { header, step, done, theme } from "../theme.js";

const agent = new SkillAgent();

export function registerSkill(program: Command): void {
  const skill = program.command("skill").description("Skills action layer");

  skill
    .command("install")
    .argument("<name>", "skill name")
    .action((name: string) => {
      const id = resolveSkillName(name);
      const ok = agent.install(id);
      if (!ok) {
        console.log(theme.risk(`Unknown skill: ${name}`));
        process.exit(1);
      }
      done(`Installed ${id}`);
    });

  skill
    .command("run")
    .argument("<name>", "skill name")
    .option("--capital <n>", "capital", "1000")
    .option("--max-exposure <n>", "max exposure", "0.2")
    .action(async (name: string, opts: { capital: string; maxExposure: string }) => {
      header("SKILL RUNTIME", "prism");
      const id = resolveSkillName(name);
      step(`Acquiring lock for ${id}...`);
      const result = await agent.use(id, {
        capital: Number(opts.capital),
        maxExposure: Number(opts.maxExposure),
      });
      if (result.status === "blocked") {
        console.log(theme.warn(result.output.error as string));
        process.exit(1);
      }
      done(`Skill ${id} complete`);
      console.log(JSON.stringify(result, null, 2));
    });

  skill.command("status").action(() => {
    const locks = agent.locks();
    done("SKILL STATUS");
    console.log(JSON.stringify({ installed: locks.installed, active_lock: locks.active }, null, 2));
    console.log("\nMarketplace:");
    console.log(JSON.stringify(listSkills(), null, 2));
  });

  skill.command("locks").action(() => {
    const locks = agent.locks();
    if (locks.active) console.log(theme.warn(`Active lock: ${locks.active}`));
    else done("No active skill lock");
    console.log(JSON.stringify(locks, null, 2));
  });
}
