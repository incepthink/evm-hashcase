import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareersChrome from "@/components/careers/CareersChrome";
import JobView from "@/components/careers/JobView";
import { GENERAL_APPLICATION, ROLES, getRole } from "@/components/home/careers";

type Params = { params: Promise<{ slug: string }> };

const isGeneral = (slug: string) => slug === GENERAL_APPLICATION.slug;

export const dynamicParams = false;

export function generateStaticParams() {
  return [...ROLES.map((r) => ({ slug: r.slug })), { slug: GENERAL_APPLICATION.slug }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role && !isGeneral(slug)) return {};
  return {
    title: `${role?.title ?? GENERAL_APPLICATION.title} — Careers at HashCase`,
    description: role?.intro ?? GENERAL_APPLICATION.intro,
  };
}

export default async function JobPage({ params }: Params) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role && !isGeneral(slug)) notFound();

  return (
    <CareersChrome>
      <JobView role={role} />
    </CareersChrome>
  );
}
