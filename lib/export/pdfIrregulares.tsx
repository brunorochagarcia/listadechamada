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
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 4, marginBottom: 2 },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottom: "1 solid #e5e7eb" },
  colNome: { width: "40%" },
  colMatricula: { width: "20%" },
  colTurma: { width: "25%" },
  colFreq: { width: "15%", textAlign: "right" },
  thText: { fontSize: 10, fontWeight: "bold", color: "#555" },
  tdText: { fontSize: 10 },
  tdFreq: { fontSize: 10, color: "#dc2626", fontWeight: "bold" },
  summary: { marginBottom: 16, padding: "8 12", backgroundColor: "#fee2e2", borderRadius: 6 },
  summaryText: { fontSize: 11, color: "#991b1b" },
});

type Irregular = {
  nome: string;
  matricula: string;
  turma: string;
  percentual: number;
};

function IrregularesPDF({ irregulares, dataGeracao }: { irregulares: Irregular[]; dataGeracao: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Alunos em Situação Irregular</Text>
        <Text style={styles.subtitle}>Gerado em {dataGeracao} · Frequência mínima: 75%</Text>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {irregulares.length} aluno{irregulares.length !== 1 ? "s" : ""} com frequência abaixo do mínimo exigido.
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colNome]}>Nome</Text>
          <Text style={[styles.thText, styles.colMatricula]}>Matrícula</Text>
          <Text style={[styles.thText, styles.colTurma]}>Turma</Text>
          <Text style={[styles.thText, styles.colFreq]}>Freq.</Text>
        </View>

        {irregulares.map((a, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tdText, styles.colNome]}>{a.nome}</Text>
            <Text style={[styles.tdText, styles.colMatricula]}>{a.matricula}</Text>
            <Text style={[styles.tdText, styles.colTurma]}>{a.turma}</Text>
            <Text style={[styles.tdFreq, styles.colFreq]}>{a.percentual}%</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function gerarIrregularesPDF(irregulares: Irregular[]): Promise<Uint8Array> {
  const dataGeracao = new Date().toLocaleDateString("pt-BR");
  const buffer = await renderToBuffer(
    <IrregularesPDF irregulares={irregulares} dataGeracao={dataGeracao} />
  );
  return new Uint8Array(buffer);
}
