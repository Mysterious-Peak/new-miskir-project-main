import type { PestDiseaseReportForm } from '@/api/demo/pestDiseaseReport/types';
import {
  getPestReportTypeOptions,
  resolvePestReportCategoryKind,
  type PestReportDictOption
} from '@/views/demo/pestDiseaseReport/constants';

export function usePestDiseaseReportCategoryForm(options: {
  form: Ref<PestDiseaseReportForm>;
  rules: Ref<ElFormRules>;
  pestDiseaseReportFormRef: Ref<ElFormInstance | undefined>;
  pestDiseaseReportCategory: Ref<PestReportDictOption[] | undefined>;
  pestTypeDict: Ref<PestReportDictOption[] | undefined>;
}) {
  const categoryKind = computed(() =>
    resolvePestReportCategoryKind(options.form.value.category, options.pestDiseaseReportCategory.value ?? [])
  );
  const showTypeField = computed(() => categoryKind.value === 'insect' || categoryKind.value === 'disease');
  const showCategoryDetailFields = computed(() => !!categoryKind.value);
  const categoryTypeOptions = computed(() => getPestReportTypeOptions(categoryKind.value, options.pestTypeDict.value ?? []));

  const syncCategoryFormRules = () => {
    options.rules.value.category = [{ required: true, message: 'Category can not be null', trigger: 'change' }];
    options.rules.value.pestType = showTypeField.value
      ? [{ required: true, message: 'Type can not be null', trigger: 'change' }]
      : [];
  };

  const handleReportCategoryChange = () => {
    if (!showTypeField.value) {
      options.form.value.pestType = undefined;
    } else if (!categoryTypeOptions.value.some((item) => String(item.value) === String(options.form.value.pestType))) {
      options.form.value.pestType = undefined;
    }
    syncCategoryFormRules();
    nextTick(() => {
      options.pestDiseaseReportFormRef.value?.clearValidate(['pestType']);
    });
  };

  const preparePestTypeOnSubmit = () => {
    syncCategoryFormRules();
    if (!showTypeField.value) {
      options.form.value.pestType = undefined;
    }
  };

  watch(categoryKind, () => {
    syncCategoryFormRules();
  });

  onMounted(() => {
    syncCategoryFormRules();
  });

  return {
    categoryKind,
    showTypeField,
    showCategoryDetailFields,
    categoryTypeOptions,
    handleReportCategoryChange,
    syncCategoryFormRules,
    preparePestTypeOnSubmit
  };
}
