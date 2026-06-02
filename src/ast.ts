export interface G4Document {
  kind: "document";
  screen: ScreenNode;
}

export interface ScreenNode {
  kind: "screen";
  name: string;
  title: string;
  format: string;
  hero: HeroNode;
  chart: ChartNode;
  note: NoteNode;
}

export interface HeroNode {
  kind: "hero";
  text: string;
}

export interface ChartNode {
  kind: "chart";
  name: string;
  title: string;
  type: string;
  width: string;
  height: string;
  labels: string;
  highlight: string;
  data: DataRow[];
}

export interface DataRow {
  label: string;
  value: number;
}

export interface NoteNode {
  kind: "note";
  text: string;
}
