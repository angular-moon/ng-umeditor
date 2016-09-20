# ng-umeditor
封装的umeditor指令
```javascript
<script type="text/html" umeditor ng-model='content' content-change='changeHandler(content)' placeholder='提示文案...'></script>
```
***
### 可选的属性:
* config: umeditor配置项
* id: 默认使用 ng-model的变量名称作为ID, 如果需要指定id, 请使用 id={{id}}
* content-change: 内容改变时事件处理函数
* placeholder: placeholder文字
* drafts: 是否使用草稿自动恢复 
  1. **注意: 启用草稿自动恢复时  placeholder 和 ng-model 的初始值将被忽略**
  2. **当收到的事件参数id匹配时,清除草稿和内容**
  3. **用法: $scope.$broadcast('clear-umeditor', id);**
