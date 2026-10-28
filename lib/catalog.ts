export interface ProductMasterItem {
  id: number;
  productName: string;
  category: "CAD/CAM/CAE" | "CAM" | "CAD" | "CAE" | "PDM" | "Simulation" | "Additive" | "CAD/CAM";
  standardPrice: number;
  versionPlan?: string;
  active: boolean;
}

export const APPROVED_CATALOGUE: ProductMasterItem[] = [
  { id: 1, productName: "Fusion 360", category: "CAD/CAM/CAE", standardPrice: 43000, versionPlan: "Annual Subscription", active: true },
  { id: 2, productName: "Fusion Manufacturing Extension", category: "CAM", standardPrice: 92000, versionPlan: "Extension", active: true },
  { id: 3, productName: "Fusion for Design", category: "CAD", standardPrice: 138000, versionPlan: "Commercial Tier", active: true },
  { id: 4, productName: "Fusion for Manufacturing", category: "CAM", standardPrice: 129000, versionPlan: "Commercial Tier", active: true },
  { id: 5, productName: "Fusion Simulation Extension", category: "CAE", standardPrice: 92000, versionPlan: "Extension", active: true },
  { id: 6, productName: "Fusion Design Extension", category: "CAD", standardPrice: 37000, versionPlan: "Extension", active: true },
  { id: 7, productName: "Fusion Contributor", category: "PDM", standardPrice: 15000, versionPlan: "Collaboration Seat", active: true },
  { id: 8, productName: "Inventor", category: "CAD/CAM/CAE", standardPrice: 140000, versionPlan: "Professional License", active: true },
  { id: 9, productName: "PowerMill Standard", category: "CAM", standardPrice: 188000, versionPlan: "High-Speed Milling", active: true },
  { id: 10, productName: "PowerMill Ultimate", category: "CAM", standardPrice: 285000, versionPlan: "5-Axis Advanced", active: true },
  { id: 11, productName: "PowerShape", category: "CAD/CAM", standardPrice: 101000, versionPlan: "Modeling for Manufacture", active: true },
  { id: 12, productName: "FeatureCAM", category: "CAM", standardPrice: 244000, versionPlan: "Feature-based Automation", active: true },
  { id: 13, productName: "Fusion Manage", category: "PDM", standardPrice: 60000, versionPlan: "Cloud PLM", active: true },
  { id: 14, productName: "Vault", category: "PDM", standardPrice: 47000, versionPlan: "Workgroup / Professional", active: true },
  { id: 15, productName: "Moldflow", category: "Simulation", standardPrice: 490000, versionPlan: "Injection Molding Simulation", active: true },
  { id: 16, productName: "Netfabb", category: "Additive", standardPrice: 216000, versionPlan: "Additive Manufacturing", active: true },
  { id: 17, productName: "PDMC", category: "PDM", standardPrice: 183000, versionPlan: "Product Design & Manufacturing Collection", active: true },
];
