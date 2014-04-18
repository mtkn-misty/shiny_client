$(function(){
//設定 //////////////
  var chartSetting = {
    hist: {
      xaxis: 'numeric',
      yaxis: false,
      color: 'factor'
    },
    scatter: {
      xaxis: 'numeric',
      yaxis: 'numeric',
      color: 'any'
    },
    line: {
      xaxis: 'numeric',
      yaxis: 'numeric',
      color: 'any'
    },
    boxplot: {
      xaxis: 'factor',
      yaxis: 'numeric',
      color: false
    },
    bubble: {
      xaxis: 'numeric',
      yaxis: 'numeric',
      color: 'numeric'
    }
  };

//準備 ////////
  var conn = new WebSocket('ws://localhost:8081');
  $('.draggable').draggable({revert: 'invalid'});

//画面の状態変数 ////////
  var status;
  var dragItem;

//関数 /////////////
  //画面の状態の初期化
  var reset = function(){
    status = {
      xaxis: undefined,
      yaxis: undefined,
      color: undefined
    };
    $('#yaxis div').text('Y軸');
    $('#xaxis div').text('X軸');
    $('#color div').text('色/サイズ');
    $('#chartArea div').removeClass('appended');

    setTimeout(function(){
      status.chartType = $('#chartType label.active').data('type');

      _(chartSetting[status.chartType]).each(function(v, k){
        if(v){
          $('#' + k).attr('disabled', false);
        }else{
          $('#' + k).attr('disabled', true);
        }
      });
    });
  };
  //グラフ描画の準備チェック。準備ができていればtrue
  var checkStatus = function(){
    var chartDataType = chartSetting[status.chartType];
    if((status.xaxis || !chartDataType.xaxis) &&
        (status.yaxis || !chartDataType.yaxis) &&
        (status.color || !chartDataType.color)){
      return true;
    }
    return false;
  };

  var checkDataType = function($this){
    var chartDataType = chartSetting[status.chartType][$this.data('type')];
    if(!$this.attr('disabled') && (chartDataType === 'any' ||
      chartDataType === $dragItem.data('type'))){
      return true;
    }
    return false;
  };

  //グラフ描画のためのデータ送信
  var sendChartInfo = function(){
    var json = {};
    json.method = 'init';
    json.data = {
      '.clientdata_allowDataUriScheme': true
    };

    json.data['.clientdata_output_chartPlot_hidden'] = false;
    json.data['.clientdata_output_chartPlot_width'] = 400;
    json.data['.clientdata_output_chartPlot_height'] = 280;
    json.data['xaxis'] = status.xaxis;
    json.data['yaxis'] = status.yaxis;
    json.data['color'] = status.color;
    json.data['chartType'] = status.chartType;

    //データ送信
    console.log(['SEND',json]);
    conn.send(JSON.stringify(json));
  };

//イベント定義 ////////////
  //グラフタイプ切替時
  $('#chartType label').on('click', function(e){
    reset();
  });

  //ドラッグ
  $('.draggable').draggable({
    start: function(event, ui){
      $dragItem = $(this);
    },
    stop: function(event, ui){
      $dragItem = undefined;
    }
  });

  //ドロップ時
  $('.droppable').droppable({
    activeClass: function() {
      if(checkDataType($(this))){
        return 'ui-state-active-org';
      }
      return;
    },
    hoverClass: function(){
      if(checkDataType($(this))){
        return 'ui-state-hover-org';
      }
      return;
    },
    drop: function(event, ui) {
      var $this = $(this);
      var name = ui.draggable.data('name');

      //型チェック
      var chartDataType = chartSetting[status.chartType][$this.data('type')];
      if(chartDataType === 'any' ||
          chartDataType === ui.draggable.data('type')){
        //状態の記録
        status[$this.data('type')] = name;
        $('div', $this).text(name);
        $this.addClass('appended');

        ui.draggable.css({left: 0, top: 0});

        if(checkStatus()){
          sendChartInfo();
        }
      }else{
        ui.draggable.css({left: 0, top: 0});
      }
    }
  });

  //WS通信 - データ受信時
  conn.onmessage = function (e) {
    console.log('RECEIVE: ' + e.data);
    var json = JSON.parse(e.data);
    if(json.values && json.values.chartPlot && json.values.chartPlot.src){
      $('#chartImg').attr('src', json.values.chartPlot.src);
    }
  };

  reset();
});

