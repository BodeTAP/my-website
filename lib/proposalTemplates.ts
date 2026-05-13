import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PROPOSAL_GENERATOR_COST = 5;

export type ProposalSection = {
  title: string;
  body: string;
};

export type ProposalVariable = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea";
};

export type ProposalTemplatePayload = {
  name: string;
  category: string;
  description?: string;
  sections: ProposalSection[];
  variables?: ProposalVariable[];
};

export type GeneratedProposalContent = {
  title: string;
  sections: ProposalSection[];
};

const DEFAULT_TEMPLATES: ProposalTemplatePayload[] = [
  {
    name: "Penawaran Produk & Layanan",
    category: "Sales",
    description: "Template proposal untuk menawarkan produk, jasa, atau paket layanan ke calon pelanggan.",
    variables: [
      { key: "prospectName", label: "Nama calon klien", placeholder: "Budi Santoso" },
      { key: "businessName", label: "Nama bisnis klien", placeholder: "PT Sukses Bersama" },
      { key: "offerName", label: "Produk atau layanan", placeholder: "Paket layanan operasional bulanan" },
      { key: "problem", label: "Kebutuhan atau masalah klien", type: "textarea", placeholder: "Proses kerja masih manual dan memakan banyak waktu" },
      { key: "solution", label: "Solusi yang ditawarkan", type: "textarea", placeholder: "Layanan pendampingan, setup proses, dan laporan rutin" },
      { key: "benefits", label: "Manfaat utama", type: "textarea", placeholder: "Efisiensi waktu, kontrol lebih rapi, dan keputusan lebih cepat" },
      { key: "deliverables", label: "Deliverable", type: "textarea", placeholder: "Konsultasi, implementasi, laporan, dan sesi evaluasi" },
      { key: "timeline", label: "Estimasi waktu", placeholder: "2-4 minggu" },
      { key: "budgetRange", label: "Estimasi biaya", placeholder: "Rp 5.000.000 - Rp 10.000.000" },
    ],
    sections: [
      {
        title: "Ringkasan Kebutuhan",
        body: "{{businessName}} membutuhkan solusi untuk {{problem}}. Proposal ini merangkum penawaran {{offerName}} yang dirancang agar kebutuhan tersebut dapat ditangani secara terukur dan mudah dievaluasi.",
      },
      {
        title: "Solusi yang Ditawarkan",
        body: "{{solution}}. Pendekatan ini diharapkan memberi manfaat utama berupa {{benefits}}.",
      },
      {
        title: "Ruang Lingkup",
        body: "Deliverable yang termasuk dalam penawaran ini adalah {{deliverables}}. Estimasi pelaksanaan adalah {{timeline}}, menyesuaikan kesiapan data dan prioritas pekerjaan.",
      },
      {
        title: "Estimasi Biaya dan Langkah Berikutnya",
        body: "Estimasi biaya berada pada kisaran {{budgetRange}}. Jika proposal ini sesuai, tahap berikutnya adalah finalisasi ruang lingkup, jadwal kerja, dan konfirmasi persetujuan bersama {{prospectName}}.",
      },
    ],
  },
  {
    name: "Kerja Sama Bisnis",
    category: "Partnership",
    description: "Template proposal untuk kolaborasi, kemitraan, reseller, sponsorship, atau kerja sama operasional.",
    variables: [
      { key: "prospectName", label: "Nama pihak tujuan", placeholder: "Ibu Sari" },
      { key: "businessName", label: "Nama organisasi/mitra", placeholder: "PT Mitra Sejahtera" },
      { key: "partnershipType", label: "Jenis kerja sama", placeholder: "Kemitraan distribusi produk" },
      { key: "objectives", label: "Tujuan kerja sama", type: "textarea", placeholder: "Memperluas jangkauan pasar dan meningkatkan penjualan bersama" },
      { key: "scope", label: "Ruang lingkup kerja sama", type: "textarea", placeholder: "Distribusi produk, promosi bersama, dan pelaporan performa bulanan" },
      { key: "responsibilities", label: "Pembagian peran", type: "textarea", placeholder: "Pihak A menyiapkan produk, Pihak B mengelola penjualan dan relasi pelanggan" },
      { key: "successMetrics", label: "Indikator keberhasilan", placeholder: "Target penjualan, jumlah pelanggan baru, dan retensi pelanggan" },
      { key: "commercialTerms", label: "Skema komersial", placeholder: "Komisi 15% dari penjualan bersih" },
    ],
    sections: [
      {
        title: "Latar Belakang",
        body: "Kami mengusulkan {{partnershipType}} dengan {{businessName}} untuk mencapai tujuan: {{objectives}}. Kerja sama ini dirancang agar kedua pihak mendapatkan nilai bisnis yang jelas dan dapat diukur.",
      },
      {
        title: "Ruang Lingkup Kerja Sama",
        body: "Ruang lingkup kerja sama meliputi {{scope}}. Aktivitas akan disusun dalam alur yang mudah dipantau agar progres dan hasil dapat dievaluasi secara berkala.",
      },
      {
        title: "Peran dan Tanggung Jawab",
        body: "Pembagian peran yang diusulkan adalah {{responsibilities}}. Struktur ini membantu menjaga koordinasi, akuntabilitas, dan kecepatan pengambilan keputusan.",
      },
      {
        title: "Indikator dan Skema Komersial",
        body: "Keberhasilan kerja sama akan diukur melalui {{successMetrics}}. Skema komersial yang diusulkan adalah {{commercialTerms}} dan dapat disesuaikan setelah diskusi bersama {{prospectName}}.",
      },
    ],
  },
  {
    name: "Program atau Event",
    category: "Program",
    description: "Template proposal untuk acara, pelatihan, aktivasi brand, workshop, atau program internal perusahaan.",
    variables: [
      { key: "prospectName", label: "Nama penanggung jawab", placeholder: "Pak Andi" },
      { key: "businessName", label: "Nama organisasi", placeholder: "PT Maju Bersama" },
      { key: "programName", label: "Nama program/event", placeholder: "Workshop Produktivitas Tim" },
      { key: "audience", label: "Target peserta", placeholder: "Karyawan divisi operasional" },
      { key: "goals", label: "Tujuan program", type: "textarea", placeholder: "Meningkatkan koordinasi tim dan kualitas pelayanan" },
      { key: "agenda", label: "Agenda utama", type: "textarea", placeholder: "Sesi materi, praktik kelompok, diskusi, dan evaluasi" },
      { key: "deliverables", label: "Deliverable", type: "textarea", placeholder: "Konsep acara, fasilitator, materi, dokumentasi, dan laporan akhir" },
      { key: "timeline", label: "Waktu pelaksanaan", placeholder: "1 hari atau sesuai jadwal perusahaan" },
      { key: "budgetRange", label: "Estimasi biaya", placeholder: "Rp 8.000.000 - Rp 15.000.000" },
    ],
    sections: [
      {
        title: "Gambaran Program",
        body: "{{programName}} untuk {{businessName}} ditujukan bagi {{audience}} dengan tujuan {{goals}}. Program ini dirancang agar peserta mendapatkan pengalaman yang praktis dan relevan dengan kebutuhan organisasi.",
      },
      {
        title: "Konsep dan Agenda",
        body: "Agenda utama meliputi {{agenda}}. Alur program dapat disesuaikan dengan durasi, jumlah peserta, dan prioritas yang ditetapkan bersama {{prospectName}}.",
      },
      {
        title: "Deliverable",
        body: "Deliverable yang disiapkan mencakup {{deliverables}}. Setiap komponen akan disusun agar pelaksanaan berjalan rapi dan hasilnya mudah ditindaklanjuti.",
      },
      {
        title: "Waktu dan Estimasi Biaya",
        body: "Waktu pelaksanaan direncanakan {{timeline}}. Estimasi biaya berada pada kisaran {{budgetRange}}, menyesuaikan skala acara, jumlah peserta, dan kebutuhan pendukung.",
      },
    ],
  },
];

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function ensureDefaultProposalTemplates() {
  const defaultNames = DEFAULT_TEMPLATES.map((template) => template.name);

  await prisma.proposalTemplate.updateMany({
    where: {
      clientId: null,
      isDefault: true,
      name: { notIn: defaultNames },
    },
    data: { isActive: false },
  });

  for (const template of DEFAULT_TEMPLATES) {
    const existing = await prisma.proposalTemplate.findFirst({
      where: { clientId: null, isDefault: true, name: template.name },
      select: { id: true },
    });

    const data = {
      name: template.name,
      category: template.category,
      description: template.description,
      sections: asJson(template.sections),
      variables: asJson(template.variables ?? []),
      isDefault: true,
      isActive: true,
    };

    if (existing) {
      await prisma.proposalTemplate.update({ where: { id: existing.id }, data });
    } else {
      await prisma.proposalTemplate.create({ data });
    }
  }
}

export async function getVisibleProposalTemplates(clientId: string) {
  await ensureDefaultProposalTemplates();

  return prisma.proposalTemplate.findMany({
    where: {
      isActive: true,
      OR: [
        { isDefault: true, clientId: null },
        { clientId },
      ],
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "asc" },
    ],
  });
}

export function parseSections(value: unknown): ProposalSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((section) => {
      const record = section as Record<string, unknown>;
      return {
        title: typeof record.title === "string" ? record.title : "",
        body: typeof record.body === "string" ? record.body : "",
      };
    })
    .filter((section) => section.title.trim() || section.body.trim());
}

export function parseVariables(value: unknown): ProposalVariable[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((variable) => {
      const record = variable as Record<string, unknown>;
      const type: ProposalVariable["type"] = record.type === "textarea" ? "textarea" : "text";
      return {
        key: typeof record.key === "string" ? record.key : "",
        label: typeof record.label === "string" ? record.label : "",
        placeholder: typeof record.placeholder === "string" ? record.placeholder : undefined,
        type,
      };
    })
    .filter((variable) => variable.key.trim() && variable.label.trim());
}

export function renderTemplateSections(
  sections: ProposalSection[],
  input: Record<string, unknown>,
): ProposalSection[] {
  const render = (text: string) =>
    text.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key: string) => {
      const value = input[key];
      if (value === null || value === undefined) return "";
      return String(value).trim();
    });

  return sections.map((section) => ({
    title: render(section.title),
    body: render(section.body),
  }));
}

export function inferProposalTitle(templateName: string, input: Record<string, unknown>) {
  const target =
    (typeof input.businessName === "string" && input.businessName.trim()) ||
    (typeof input.prospectName === "string" && input.prospectName.trim()) ||
    "Calon Klien";

  return `${templateName} - ${target}`;
}
