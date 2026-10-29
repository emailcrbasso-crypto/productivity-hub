import { createClient } from "@/lib/supabase/server";
import { PlanList } from "@/modules/five-w2h/PlanList";
import { ModuleHeader, FiveW2HLogo } from "@/components/module-header";
import { ToolHelp } from "@/components/tool-help";
import type { FiveW2HPlan } from "@/modules/five-w2h/types";

export const metadata = { title: "5W2H" };

export default async function FiveW2HPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("five_w2h_plans")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const plans = (data ?? []) as FiveW2HPlan[];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <ModuleHeader
        logo={<FiveW2HLogo />}
        title="Matriz 5W2H"
        subtitle="Transforme intenções em planos claros respondendo 7 perguntas essenciais."
      />
      <ToolHelp
        benefit="Você sai do vago para o concreto. Ao responder as 7 perguntas você elimina dúvidas, alinha expectativas e já sabe exatamente o que precisa acontecer para o plano sair do papel."
        steps={[
          "Clique em Novo plano e dê um nome que identifique bem a iniciativa, o projeto ou a ação que você quer estruturar.",
          "Responda as 7 perguntas uma a uma: O quê, Por quê, Onde, Quando, Quem, Como e, se necessário, Quanto custa. Não precisa ser perfeito — escreva o que sabe agora e ajuste depois.",
          "Quando o plano estiver em execução e as ações concluídas, marque como concluído. Você ganha XP e o plano vai para o histórico.",
        ]}
        examples={[
          "\"Lançamento do produto X\" — O quê: página de vendas + campanha. Quem: marketing. Quando: 15 de novembro.",
          "\"Onboarding de novos clientes\" — Como: checklist automatizado no CRM. Por quê: reduzir churn nos primeiros 30 dias.",
          "\"Treinamento da equipe de vendas\" — Onde: online ao vivo. Quanto custa: 3 horas de facilitador interno.",
          "\"Pesquisa de satisfação trimestral\" — Quem: equipe de CS. Quando: última semana de cada trimestre.",
          "\"Redução de custos operacionais\" — Por quê: margem abaixo da meta. Como: auditoria de contratos e renegociação.",
          "\"Lançamento de canal no YouTube\" — O quê: 4 vídeos por mês. Como: gravar aos sábados, editar na semana seguinte.",
        ]}
      />
      <PlanList plans={plans} />
    </div>
  );
}
