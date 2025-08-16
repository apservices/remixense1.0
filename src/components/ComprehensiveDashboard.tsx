import React from "react";

/** Stub provisório para desbloquear o build.
 *  TODO: trocar pelo dashboard real quando disponível.
 */
const ComprehensiveDashboard: React.FC = () => {
  return (
    <div className="p-6 text-white bg-black min-h-[60vh]">
      <h1 className="text-2xl font-semibold mb-2">Comprehensive Dashboard</h1>
      <p className="opacity-80">
        Este é um placeholder. Substitua por widgets reais (KPIs, cards, gráficos).
      </p>
    </div>
  );
};

export default ComprehensiveDashboard;
export { ComprehensiveDashboard };