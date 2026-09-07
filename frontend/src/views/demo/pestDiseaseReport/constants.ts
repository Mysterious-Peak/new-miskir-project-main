export type PestReportCategoryKind = 'insect' | 'disease' | 'nutrient';

export interface PestReportDictOption {
  label: string;
  value: string;
}

const INSECT_TYPE_LABELS = ['Aphids', 'Armyworm', 'Cutworm'];
const DISEASE_TYPE_LABELS = ['Blight', 'Other disease types'];

const toOptions = (labels: string[]): PestReportDictOption[] =>
  labels.map((label) => ({
    label,
    value: label
  }));

export const PEST_REPORT_INSECT_TYPE_OPTIONS = toOptions(INSECT_TYPE_LABELS);
export const PEST_REPORT_DISEASE_TYPE_OPTIONS = toOptions(DISEASE_TYPE_LABELS);

export const PEST_DISEASE_REPORT_CATEGORY_DEFAULT_OPTIONS: PestReportDictOption[] = [
  { label: 'Insect', value: 'Insect' },
  { label: 'Disease', value: 'Disease' },
  { label: 'Nutrient Deficiency', value: 'Nutrient Deficiency' }
];

export const resolvePestDiseaseReportCategoryOptions = (
  dict: PestReportDictOption[] | undefined
): PestReportDictOption[] => {
  return dict?.length ? dict : PEST_DISEASE_REPORT_CATEGORY_DEFAULT_OPTIONS;
};

export const resolvePestReportCategoryKind = (
  categoryValue: string | number | undefined,
  categoryDict: PestReportDictOption[] = []
): PestReportCategoryKind | undefined => {
  if (categoryValue === undefined || categoryValue === null || categoryValue === '') {
    return undefined;
  }

  const dictItem = categoryDict.find((item) => String(item.value) === String(categoryValue));
  const label = (dictItem?.label ?? String(categoryValue)).toLowerCase();

  if (label.includes('insect')) {
    return 'insect';
  }
  if (label.includes('disease')) {
    return 'disease';
  }
  if (label.includes('nutrient')) {
    return 'nutrient';
  }

  return undefined;
};

const filterDictByLabels = (dict: PestReportDictOption[], labels: string[]): PestReportDictOption[] => {
  const normalized = labels.map((label) => label.toLowerCase());
  const matched = dict.filter((item) => normalized.includes((item.label ?? '').toLowerCase()));
  return matched.length ? matched : toOptions(labels);
};

export const getPestReportTypeOptions = (
  kind: PestReportCategoryKind | undefined,
  pestTypeDict: PestReportDictOption[] = []
): PestReportDictOption[] => {
  if (kind === 'insect') {
    return filterDictByLabels(pestTypeDict, INSECT_TYPE_LABELS);
  }
  if (kind === 'disease') {
    return filterDictByLabels(pestTypeDict, DISEASE_TYPE_LABELS);
  }
  return [];
};
