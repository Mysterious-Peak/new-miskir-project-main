<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <div class="flex gap-6">
        <div class="w-100">
          <el-form ref="farmlandFormRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="Farmer ID" prop="farmerId">
              <el-input v-model="form.farmerId" placeholder="Please input Farmer ID" disabled />
            </el-form-item>
            <el-form-item label="Kebele ID" prop="kebeleId">
              <el-input v-model="form.kebeleId" placeholder="Please input Kebele ID" disabled />
            </el-form-item>
            <el-form-item label="Longitude" prop="gpsLong">
              <el-input v-model="form.gpsLong" placeholder="Please input Longitude" disabled />
            </el-form-item>
            <el-form-item label="Latitude" prop="gpsLat">
              <el-input v-model="form.gpsLat" placeholder="Please input Latitude" disabled />
            </el-form-item>
            <!-- <el-form-item label="Polygon" prop="gpsPolygon">
              <el-input v-model="form.gpsPolygon" type="textarea" placeholder="Please input Polygon" disabled />
            </el-form-item> -->
            <el-form-item label="Area(ha)" prop="areaTa">
              <el-input v-model="form.areaTa" placeholder="Please input Area(ha)" disabled />
            </el-form-item>
            <el-form-item label="Soil Type" prop="soilCode">
              <el-select v-model="form.soilCode" placeholder="Please select Soil Type" style="width: 100%" disabled clearable>
                <el-option v-for="item in soilTypeMasterList" :key="item.id" :label="item.soilName" :value="item.soilCode" />
              </el-select>
            </el-form-item>
            <el-form-item label="Irrigation Type" prop="irrigationCode">
              <el-select v-model="form.irrigationCode" placeholder="Please select Irrigation Type" style="width: 100%" disabled clearable>
                <el-option v-for="item in irrigationTypeMasterList" :key="item.id" :label="item.irrigationName" :value="item.irrigationCode" />
              </el-select>
            </el-form-item>
            <el-form-item label="Slope Class" prop="slopeClass">
              <el-select v-model="form.slopeClass" placeholder="Please select Slope Class" style="width: 100%" disabled clearable>
                <el-option v-for="item in slope_class" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Land Use Type" prop="landUseType">
              <el-select v-model="form.landUseType" placeholder="Please select Use Type" style="width: 100%" disabled clearable>
                <el-option v-for="item in land_use_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- 需求2.3：农田新增属性 -->
            <el-form-item label="Altitude(m)" prop="elevationM">
              <el-input v-model="form.elevationM" placeholder="Altitude(m)" disabled />
            </el-form-item>
            <el-form-item label="Land Ownership Type" prop="landOwnershipType">
              <el-select v-model="form.landOwnershipType" placeholder="Please select" style="width: 100%" disabled clearable>
                <el-option v-for="item in land_ownership_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Aspect / Slope Direction" prop="slopeAspect">
              <el-select v-model="form.slopeAspect" placeholder="Please select" style="width: 100%" disabled clearable>
                <el-option v-for="item in slope_aspect" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Sampling depth" prop="samplingDepth">
              <el-select v-model="form.samplingDepth" placeholder="Please select" style="width: 100%" disabled clearable>
                <el-option v-for="item in sampling_depth" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Land use history" prop="landUseRecord">
              <el-select v-model="form.landUseRecord" placeholder="Please select" style="width: 100%" disabled clearable>
                <el-option v-for="item in land_use_record" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Accessibility to infrastructure" prop="infrastructureAccessibility">
              <el-input v-model="form.infrastructureAccessibility" type="textarea" placeholder="" disabled />
            </el-form-item>
            <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
              <el-input v-model="form.createdUserName" placeholder="Please input Created By" disabled />
            </el-form-item>
            <el-form-item label="Created Time" prop="createTime" v-if="isViewFlag(form)">
              <el-date-picker
                clearable
                v-model="form.createTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="Please select"
                disabled
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Approved By" prop="approvedUserName" v-if="isViewFlag(form)">
              <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
            </el-form-item>
            <el-form-item label="Approved Time" prop="approvedTime" v-if="isViewFlag(form)">
              <el-date-picker
                clearable
                v-model="form.approvedTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="Please select"
                disabled
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Approval Comment" prop="approvedComment">
              <el-input
                v-model="form.approvedComment"
                type="textarea"
                placeholder="Please input"
                :disabled="form.status != ApprovalStatus.Draft.toString()"
              />
            </el-form-item>
            <!-- <el-form-item label="Create Date" prop="daCreateTime">
              <el-date-picker
                clearable
                v-model="form.daCreateTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="Please select"
                disabled
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Remark" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="Please input" disabled />
            </el-form-item> -->
            <!-- <el-form-item label="批准人" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="请输入批准人" />
        </el-form-item>
        <el-form-item label="批准时间" prop="approvedTime">
          <el-date-picker clearable v-model="form.approvedTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择批准时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="拒绝原因" prop="rejectionReason">
          <el-input v-model="form.rejectionReason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="创建者(DA)" prop="daCreateBy">
          <el-input v-model="form.daCreateBy" placeholder="请输入创建者(DA)" />
        </el-form-item>
        <el-form-item label="创建时间" prop="daCreateTime">
          <el-date-picker clearable v-model="form.daCreateTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
          </el-form>
        </div>
        <div>
          <MapPolygonForFarmLandApproval
            :init-polygon="form.gpsPolygon ? JSON.parse(form.gpsPolygon) : []"
            :gps-lat="dialogMapGpsLat"
            :gps-long="dialogMapGpsLong"
          ></MapPolygonForFarmLandApproval>
          <!-- <div class="mx-10">
            <el-radio-group v-model="form.status">
              <el-radio :value="ApprovalStatus.Approved.toString()" size="large">Approval</el-radio>
              <el-radio :value="ApprovalStatus.Rejected.toString()" size="large">Reject</el-radio>
            </el-radio-group>
             -->
        </div>
      </div>
      <div class="form-footer">
        <div class="dialog-footer" v-if="form.status && form.status == ApprovalStatus.Draft.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="ApprovalForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RejectForm">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
        <div class="dialog-footer" v-if="form.status != ApprovalStatus.Draft.toString()">
          <el-button @click="cancel">Close</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FarmlandApprovalForm" lang="ts">
import { addFarmland, getFarmland, updateFarmland } from '@/api/demo/farmland';
import { FarmlandForm } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import MapPolygonForFarmLandApproval from '@/components/Map/MapPolygonForFarmLandApproval.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { slope_class, land_use_type } = toRefs<any>(proxy?.useDict('slope_class', 'land_use_type'));
// 需求2.3：新增字典引用
const { land_ownership_type, slope_aspect, sampling_depth, land_use_record } = toRefs<any>(
  proxy?.useDict('land_ownership_type', 'slope_aspect', 'sampling_depth', 'land_use_record')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const farmlandFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
async function getSoilTypes() {
  const res = await listSoilTypeMaster({ pageNum: 1, pageSize: 10 });
  soilTypeMasterList.value = res.rows;
}
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
async function getIrrigationTypes() {
  const res = await listIrrigationTypeMaster({ pageNum: 1, pageSize: 10 });
  irrigationTypeMasterList.value = res.rows;
}

const initFormData: FarmlandForm = {
  id: undefined,
  farmerId: undefined,
  kebeleId: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  gpsPolygon: undefined,
  areaTa: undefined,
  soilCode: undefined,
  irrigationCode: undefined,
  slopeClass: undefined,
  landUseType: undefined,
  elevationM: undefined,
  landOwnershipType: undefined,
  slopeAspect: undefined,
  samplingDepth: undefined,
  landUseRecord: undefined,
  infrastructureAccessibility: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedTime: undefined,
  rejectionReason: undefined,
  createdUserName: undefined,
  createTime: undefined,
  remark: undefined,
  approvedComment: undefined
};

const form = ref<FarmlandForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'Farm ID can not be null', trigger: 'blur' }],
  farmerId: [{ required: true, message: 'Farmer ID can not be null', trigger: 'blur' }],
  kebeleId: [{ required: true, message: 'Kebele ID can not be null', trigger: 'blur' }],
  areaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }]
};

const toDialogGpsNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const dialogMapGpsLat = computed(() => toDialogGpsNumber(form.value.gpsLat));
const dialogMapGpsLong = computed(() => toDialogGpsNumber(form.value.gpsLong));

const isViewFlag = (data) => {
  return data.status != ApprovalStatus.Draft.toString();
};

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) return;
  pageLoading.value = true;
  try {
    const res = await getFarmland(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

const ApprovalForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();
      // form.value.approvedTime = new Date().toLocaleString();

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};
const RejectForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const RevisionForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

onMounted(() => {
  loadRecord();
  getSoilTypes();
  getIrrigationTypes();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
