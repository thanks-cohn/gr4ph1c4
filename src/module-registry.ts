import type { ChartNode } from "./ast.js";
import { renderChart } from "./render-chart.js";

export interface RegisteredChartModule {
  readonly name: string;
  readonly initial: ChartNode;
  working: ChartNode;
  rendered: string;
}

export interface EditChartPatch {
  readonly type?: string;
}

function cloneChart(chart: ChartNode): ChartNode {
  return {
    ...chart,
    data: chart.data.map((row) => ({ ...row })),
  };
}

export class ModuleRegistry {
  private readonly modules = new Map<string, RegisteredChartModule>();

  register(name: string, chart: ChartNode): RegisteredChartModule {
    if (this.modules.has(name)) {
      throw new Error(`module already registered: ${name}`);
    }

    const initial = cloneChart(chart);
    const working = cloneChart(chart);
    const module = {
      name,
      initial,
      working,
      rendered: renderChart(working),
    };
    this.modules.set(name, module);
    return module;
  }

  get(name: string): RegisteredChartModule {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`module not registered: ${name}`);
    }
    return module;
  }

  edit(name: string, patch: EditChartPatch): ChartNode {
    const module = this.get(name);
    module.working = {
      ...module.working,
      type: patch.type ?? module.working.type,
      data: module.working.data.map((row) => ({ ...row })),
    };
    return module.working;
  }

  resend(name: string): string {
    const module = this.get(name);
    module.rendered = renderChart(module.working);
    return module.rendered;
  }

  rollback(name: string): ChartNode {
    const module = this.get(name);
    module.working = cloneChart(module.initial);
    module.rendered = renderChart(module.working);
    return module.working;
  }
}
