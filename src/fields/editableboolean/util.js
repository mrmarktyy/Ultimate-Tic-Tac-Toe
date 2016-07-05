export function updateModel(modelName, id, attributes) {
  $.post(`/keystone/api/legacy/${modelName}/${id}`, Object.assign({action: 'updateItem'}, attributes))
}
