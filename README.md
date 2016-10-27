# ng-umeditor
封装的umeditor指令
```javascript
<script id="{{id}}" type="text/html" umeditor="umeditor" config="config" placeholder='提示文案...'></script>
```
***
### 可选的属性:
* config: umeditor配置项
* id: 默认使用 'umeditor' 如果需要指定id, 请使用 id='{{id}}' or id='id字面量'
* placeholder: placeholder文字
* drafts: 是否使用草稿自动恢复 
  1. **注意: 启用草稿自动恢复时 placeholder 将被忽略**
  2. **当收到的事件参数id匹配时,清除草稿和内容**
  3. **用法: $scope.$broadcast('clear-umeditor', id);**
