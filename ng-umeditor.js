var UM = require('umeditor');

/*
用法:
<script type="text/html" umeditor="editor" config='config' placeholder='提示文案...'></script>
可选的属性:
config: umeditor配置项
id: 默认使用 'umeditor', 如果需要指定id, 请使用 id={{id}}
placeholder: placeholder文字
drafts: 是否使用草稿自动恢复, 注意: 启用草稿自动恢复时 placeholder 将被忽略
        当收到的事件参数id匹配时,清除草稿和内容
        用法: $scope.$broadcast('clear-umeditor', id);
* */
angular.module('gm.umeditor', [])
.directive('umeditor', function(){
  return {
    restrict: 'AE',
    scope: {
      config: '=',
      umeditor: '=',
      id: '@',
      drafts: '='
    },
    transclude: true,
    link: function (scope, element, attr) {

      //获取当前的DOM元素
      var _dom = element[0];

      //默认使用'umeditor'作为编译器id, 如果需要自己指定id, 请使用id or data-id属性指定
      //规范化id中的"."为"_"
      var _id = (scope.id || 'umeditor').replace(/\./g, "_");

      _dom.setAttribute('id', _id);

      //是否启用草稿恢复,默认false,
      //drafts 和 placeholder冲突, 当启用drafts时会自动禁用placeholder
      var drafts = !!scope.drafts;

      var _config = scope.config || {
              toolbar: [
                  ' undo redo | bold italic underline strikethrough removeformat |',
                  'insertorderedlist insertunorderedlist |' ,
                  'link unlink | emotion image preview fullscreen'
              ],
              initialFrameWidth: '100%',
              initialFrameHeight: 300,
              imagePopup: true,
              autoSyncData: false,
              enableAutoSave: drafts,
              imageUrl: '/office/imageUp.jsp'
          }

      var _placeholder = drafts || _config.initialContent ? null : '<p style="font-size:14px;color:#afafaf;">' +
                        (attr.placeholder || '') +
                        '</p>';

      var _umeditor = scope.umeditor = UM.getEditor(_id, _config);

      /**
       * umeditor准备就绪后，执行逻辑
       * 如果启用了草稿功能, 恢复草稿, 并忽略placeholder
       * 如果没有启用草稿功能, 设置placeholder为编辑器的内容
       */
      _umeditor.ready(function () {
          if(drafts){
              //恢复草稿
              _umeditor.execCommand('drafts');

              //注册清除草稿和内容的事件, 当收到的事件参数id匹配时,清除草稿和内容
              //用法: $scope.$broadcast('clear-umeditor', id);
              scope.$on('clear-umeditor', function(event, id){
                  if(id == _id){
                      _umeditor.execCommand('cleardoc');
                      _umeditor.execCommand('clearlocaldata');
                  }
              });
          }else if(_placeholder){
              _umeditor.setContent(_placeholder);
          }
      });

      function isPlaceholder(content){
          return $(_placeholder)[0].textContent.replace(/\s/g, '') == content.replace(/\s/g, '');
      }

      /**
       * 添加编辑器被选中事件
       * 如果内容为placehoder, 清空内容
       */
      _umeditor.addListener('focus', function () {
          if(!drafts && _placeholder && _umeditor.hasContents() && isPlaceholder(_umeditor.getContentTxt()))
              _umeditor.setContent('');
      });

      /**
       * 添加编辑器取消选中事件
       * 如content值为空, 设置placeholder
       */
      _umeditor.addListener('blur', function () {
          if(!drafts && !_umeditor.hasContents() && _placeholder)
              _umeditor.setContent(_placeholder);
      });

      //清空内容和草稿,注销编辑器
      scope.$on('$destroy', function(){
          _umeditor.destroy();
      });

    }
  }
});

return 'gm.umeditor';