import { describe, it, expect } from "vitest";
import { parseCsv, serializeCsv } from "@/lib/csv";

describe("CSV Utilities (src/lib/csv.ts)", () => {
  describe("parseCsv", () => {
    it("mem-parse CSV sederhana dengan koma", () => {
      const input = "Sutan Palimo, 081234567890, Jorong Ladang Laweh Barat\nSiti Rahma, 081299887766, Jorong Pincuran Tujuah";
      const result = parseCsv(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(["Sutan Palimo", "081234567890", "Jorong Ladang Laweh Barat"]);
      expect(result[1]).toEqual(["Siti Rahma", "081299887766", "Jorong Pincuran Tujuah"]);
    });

    it("mempertahankan koma di dalam sel berkutip", () => {
      const input = '"Dt. Marajo, S.H.", 081122334455, "Jorong Ladang Laweh, Timur"';
      const result = parseCsv(input);
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe("Dt. Marajo, S.H.");
      expect(result[0][1]).toBe("081122334455");
      expect(result[0][2]).toBe("Jorong Ladang Laweh, Timur");
    });

    it("menangani tanda kutip ganda berpasangan di dalam sel", () => {
      const input = '"Sutan ""Kayo"" Bagindo", 081211112222, Jorong Pincuran Tujuah';
      const result = parseCsv(input);
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe('Sutan "Kayo" Bagindo');
    });

    it("menghapus UTF-8 BOM pada awal file", () => {
      const input = "\uFEFFNama, Telepon, Domisili\nBudi, 081234, Jorong Barat";
      const result = parseCsv(input);
      expect(result).toHaveLength(2);
      expect(result[0][0]).toBe("Nama");
    });

    it("menangani baris baru CRLF (Windows) dan LF (Unix)", () => {
      const crlfInput = "A,B,C\r\nD,E,F\r\n";
      const lfInput = "A,B,C\nD,E,F\n";
      expect(parseCsv(crlfInput)).toEqual([["A", "B", "C"], ["D", "E", "F"]]);
      expect(parseCsv(lfInput)).toEqual([["A", "B", "C"], ["D", "E", "F"]]);
    });

    it("melempar galat yang jelas jika tanda kutip belum ditutup", () => {
      const invalidInput = 'Sutan Palimo, "Alamat tanpa penutup, 081234';
      expect(() => parseCsv(invalidInput)).toThrow(/Kutip CSV belum ditutup/);
    });

    it("mengabaikan baris kosong di antara atau di akhir teks", () => {
      const input = "A,B\n\nC,D\n   \n";
      const result = parseCsv(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(["A", "B"]);
      expect(result[1]).toEqual(["C", "D"]);
    });
  });

  describe("serializeCsv", () => {
    it("menghasilkan teks CSV yang dikutip dengan aman dan berawalan BOM", () => {
      const rows = [
        ["Nama", "Telepon", "Domisili"],
        ["Sutan Palimo", "081234567890", "Jorong Ladang Laweh"],
      ];
      const serialized = serializeCsv(rows);
      expect(serialized.startsWith("\uFEFF")).toBe(true);
      expect(serialized).toContain('"Nama","Telepon","Domisili"');
      expect(serialized).toContain('"Sutan Palimo","081234567890","Jorong Ladang Laweh"');
    });

    it("menetralkan formula injection spreadsheet (=, +, -, @)", () => {
      const dangerousRows = [
        ["=1+2", "+6281234", "-5000", "@SUM(A1:A10)"],
      ];
      const serialized = serializeCsv(dangerousRows);
      // Karakter berisiko harus diberi prefix petik tunggal '
      expect(serialized).toContain('"\'=1+2"');
      expect(serialized).toContain('"\' +6281234"'.replace(" ", "") || serialized.includes('"\'\+6281234"'));
      expect(serialized).toContain('"\'-5000"');
      expect(serialized).toContain('"\'@SUM(A1:A10)"');
    });

    it("meng-escape tanda kutip ganda internal menjadi berpasangan", () => {
      const rows = [['Toko "Maju Jaya"', "Beras"]];
      const serialized = serializeCsv(rows);
      expect(serialized).toContain('"Toko ""Maju Jaya"""');
    });
  });
});
