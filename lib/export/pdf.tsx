import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#555", marginBottom: 20 },
  section: { marginBottom: 16 },
  label: { fontSize: 10, color: "#555", marginBottom: 2 },
  value: { fontSize: 11 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  statBox: { width: "30%", borderRadius: 6, padding: 10, backgroundColor: "#f3f4f6" },
  statLabel: { fontSize: 9, color: "#555", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 16 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottom: "1 solid #e5e7eb" },
  colData: { width: "50%" },
  colStatus: { width: "50%" },
  thText: { fontSize: 10, fontWeight: "bold", color: "#555" },
  tdText: { fontSize: 10 },
});

const statusLabel: Record<string, string> = {
  PRESENTE: "Presente",
  AUSENTE: "Ausente",
  ATRASADO: "Atrasado",
};

type Presenca = { id: string; data: Date; status: string };

type Props = {
  aluno: {
    nome: string;
    matricula: string;
    turma: { nome: string; anoLetivo: string };
  };
  presencas: Presenca[];
  percentual: number;
  situacao: string;
};

export function RelatorioPDF({ aluno, presencas, percentual, situacao }: Props) {
  const isRegular = situacao === "Regular";
  const presentes = presencas.filter((p) => p.status === "PRESENTE").length;
  const ausentes = presencas.filter((p) => p.status === "AUSENTE").length;
  const atrasados = presencas.filter((p) => p.status === "ATRASADO").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.title}>Relatório de Frequência</Text>
        <Text style={styles.subtitle}>
          {aluno.nome} · Mat. {aluno.matricula} · Turma {aluno.turma.nome} ({aluno.turma.anoLetivo})
        </Text>

        {/* Badge situação */}
        <View style={[styles.badge, { backgroundColor: isRegular ? "#dcfce7" : "#fee2e2" }]}>
          <Text style={[styles.badgeText, { color: isRegular ? "#15803d" : "#dc2626" }]}>
            {percentual}% — {situacao}
          </Text>
        </View>

        {/* Totais */}
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Presentes</Text>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>{presentes}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ausentes</Text>
            <Text style={[styles.statValue, { color: "#dc2626" }]}>{ausentes}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Atrasados</Text>
            <Text style={[styles.statValue, { color: "#ca8a04" }]}>{atrasados}</Text>
          </View>
        </View>

        {/* Tabela de histórico */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colData]}>Data</Text>
          <Text style={[styles.thText, styles.colStatus]}>Status</Text>
        </View>
        {presencas.map((p) => (
          <View key={p.id} style={styles.tableRow}>
            <Text style={[styles.tdText, styles.colData]}>
              {new Date(p.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
            </Text>
            <Text style={[styles.tdText, styles.colStatus]}>{statusLabel[p.status] ?? p.status}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function gerarRelatorioPDF(props: Props): Promise<Uint8Array> {
  const buffer = await renderToBuffer(<RelatorioPDF {...props} />);
  return new Uint8Array(buffer);
}
