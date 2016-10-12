var UM = require('umeditor');

/*
用法:
<script type="text/html" umeditor ng-model='content' content-change='changeHandler(content)' placeholder='提示文案...'></script>
可选的属性:
config: umeditor配置项
id: 默认使用 ng-model的变量名称作为ID, 如果需要指定id, 请使用 id={{id}}
content-change: 内容改变时事件处理函数
placeholder: placeholder文字
drafts: 是否使用草稿自动恢复, 注意: 启用草稿自动恢复时  placeholder 和 ng-model 的初始值将被忽略
        当收到的事件参数id匹配时,清除草稿和内容
        用法: $scope.$broadcast('clear-umeditor', id);
* */
angular.module('gm.umeditor', [])
.directive('umeditor', function(){
  return {
    restrict: 'AE',
    scope: {
      config: '=',
      contentChange: '&',
      id: '@',
      drafts: '='
    },
    require: 'ngModel',
    transclude: true,
    link: function (scope, element, attr, ngModel) {

      //获取当前的DOM元素
      var _dom = element[0];

      //默认使用ngModel name作为编译器id, 如果需要自己指定id, 请使用id or data-id属性指定
      //规范化id中的"."为"_"
      var _id = (scope.id || attr.ngModel).replace(/\./g, "_");

      _dom.setAttribute('id', _id);

      //是否启用草稿恢复,默认false,
      //drafts 和 placeholder冲突, 当启用drafts时会自动禁用placeholder
      //drafts 启用时, ngModel的初始值也会被忽略
      var drafts = !!scope.drafts;

      if(drafts){
          ngModel.$setViewValue(undefined);
      }

      var _placeholder = '<p style="font-size:14px;color:#afafaf;">' +
          (attr.placeholder || '') +
          '</p>';

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
              imageUrl: '/office/imageUp.jsp'
          }


      var _umeditor = UM.getEditor(_id, _config);

      //标记监听事件是否绑定
      var hasListener = false;

      /**
       * 对于umeditor添加内容改变事件，内容改变触发ngModel改变.
       */
      var editorToModel = function () {
          if (_umeditor.hasContents())
              ngModel.$setViewValue(_umeditor.getContent());
          else
              ngModel.$setViewValue(undefined);

          //调用指令绑定的contentChange事件处理
          (scope.contentChange || angular.noop)();
      };

      /**
       * umeditor准备就绪后，执行逻辑
       * 如果ngModel有值
       *   则给在编辑器中赋值
       *   给编辑器添加内容改变的监听事件.
       * 如果不存在
       *   则写入提示文案
       */
      _umeditor.ready(function () {
          if (ngModel.$modelValue) {
              _umeditor.setContent(ngModel.$modelValue);
              _umeditor.addListener('contentChange', editorToModel);
              hasListener = true;
          } else {
              if(!drafts)
                  _umeditor.setContent(_placeholder);
          }

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
          }

          ngModel.$formatters.push(function(value){
              ngModel.$setViewValue(value);
              _umeditor.setContent(value || '');
              if(value && !hasListener){
                  _umeditor.addListener('contentChange', editorToModel);
              }
          });
      });

      /**
       * 添加编辑器被选中事件
       * 如果ngModel没有赋值
       *   清空content
       *   给编辑器添加内容改变的监听事件
       */
      _umeditor.addListener('focus', function () {
          if (!ngModel.$modelValue) {
              if(!drafts)
                  _umeditor.setContent('');
              _umeditor.addListener('contentChange', editorToModel);
              hasListener = true;
          }
      });

      /**
       * 添加编辑器取消选中事件
       * 如content值为空
       *   取消内容改变的监听事件
       *   添加content为提示文案
       */
      _umeditor.addListener('blur', function () {
          if (!ngModel.$modelValue) {
              _umeditor.removeListener('contentChange', editorToModel);
              hasListener = false;
              if(!drafts)
                  _umeditor.setContent(_placeholder);
          }
      });

      //清空内容和草稿,注销编辑器
      scope.$on('$destroy', function(){
          _umeditor.destroy();
      });

    }
  }
});

return 'gm.umeditor';