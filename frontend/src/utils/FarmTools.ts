import request from './request';

export function isOldDate(dateString, days) {
  if (!dateString) return false;
  const createdDate = new Date(dateString).getMilliseconds();
  const now = new Date().getMilliseconds();
  const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  return diffDays > days;
}
export function isNew(dateString) {
  if (!dateString) return false;
  const createdDate = new Date(dateString);
  const now = new Date();
  // const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  // console.log(dateString);
  // console.log(now);
  // console.log(diffDays);
  // return diffDays < 1;
  return now.getFullYear() === createdDate.getFullYear() && now.getMonth() === createdDate.getMonth() && now.getDate() === createdDate.getDate();
}
// export async function getInputTypeData() {
//   const res = await request({
//     url: '/api/inputtype',
//     method: 'get'
//   });
//   return res.data;
// }
export function formatInputTypeJson(data: any) {
  const retJson = data.map((element) => {
    return {
      value: element.dict_value,
      label: element.dict_label,
      children: element.children.map((child) => {
        return { value: child.dict_value, label: child.dict_label };
      })
    };
  });
  return retJson;
}
