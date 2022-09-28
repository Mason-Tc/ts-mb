define(function(require, module, exports) {
	var m = require("mui")
	var app = require("app")
	var Vue = require("vue")
	var $ = require("jquery")
	var cameraJs = require("../../common/camera/js/camera.js");
	require("../../../js/common/select2.full.js")
	
	function formatState(state) {
	    var $state = $(
		  '<div style="position: relative;z-index: 4;font-size: 13px;display: block;border-bottom: 1px solid #ebebeb;background: white;opacity: 1;padding: 10px 0 10px 15px;margin: 0;">' + state.text + '</div>'
	    )
	    return $state
	}
	
	m.plusReady(function() {
		m.init({
			statusBarBackground: '#f7f7f7',
			swipeBack: false, //启用右滑关闭功能
			beforeback: function() {
				var webView = plus.webview.currentWebview().opener()
				mui.fire(webView, 'refresh2')
				return true
			}
		})
		ws = plus.webview.currentWebview()
		globalVue.allInfo = ws.allInfo
		globalVue.initCarNumber()
		globalVue.initPlatForm()
	})
	var globalVue = new Vue({
		el: "#app",
		data: {
			allInfo: {}, // 页面所有信息
			carPlateNos:[], //车牌号列表
			activePlateNo:null,
			imagesFiles:[], //附件列表
			popoverSure: false, // 确认弹窗控制
		},
		methods: {
			initCarNumber:function(){
				let self = this
				if(self.allInfo.carPlateNosStr){
					let list = []
					let arr = self.allInfo.carPlateNosStr.split(',')
					for(let i=0;i<arr.length;i++){
						let obj = {}
						obj.carPlateNo = obj.text = arr[i]
						obj.id = self.allInfo.idCardsStr.split(',')[i]
						obj.dirveName = self.allInfo.driverNamesStr.split(',')[i]
						obj.phoneNum = self.allInfo.phoneNosStr.split(',')[i]
						list.push(obj)
					}
					self.carPlateNos = list
				}else{
					self.carPlateNos = []
				}
				$('.q-carNumber-name').select2({
					containerCssClass:"select_box",
					templateResult: formatState,
					data: self.carPlateNos ,
					placeholder: '请选择车牌号'
				})
				$(".q-carNumber-name").val('').trigger("change")
				$(".q-carNumber-name").on("select2:select", function (e) {
					self.activePlateNo = e.params.data
				})
			},
            initPlatForm:function(){
				var self = this
				var relPath = '/api/tspad/getSysPlatformList'
				m.ajax(app.api_url + relPath, {
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						let list = []
						if(Array.isArray(data)){
							list = data.map((e)=>{
								return { id:e.id , text:e.platformName }
							})
						}
						for(let i in self.allInfo.detailList){
							$('.platform_select_' + i).select2({
								containerCssClass:"select_box_border",
								templateResult: formatState,
								data: list ,
								placeholder: '请选择月台'
							})
							$('.platform_select_' + i).val(self.allInfo.detailList[i].platformId).trigger("change")
							$('.platform_select_' + i).on("select2:select", function (e) {
								self.allInfo.detailList[i].newPlatformId = e.params.data.id
								self.initWarehouse(e.params.data.id,i)
							})
							self.initWarehouse(self.allInfo.detailList[i].platformId,i)
						}
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			initWarehouse:function(id,i){
				$('.warehouse_select_' + i).val('').trigger("change")
				var self = this
				var relPath = '/api/tspad/getWarehousePlaceList'
				m.ajax(app.api_url + relPath, {
					data:{ platformId:id },
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 60000, // 超时时间设置为1分钟
					success: function (data) {
						let list = []
						if(Array.isArray(data)){
							list = data.map((e)=>{
								return { id:e.id , text:e.warehousePlaceName }
							})
						}
						let instance = $('.warehouse_select_' + i).data('select2')
						if (instance) {
							$('.warehouse_select_' + i).select2('destroy').empty()
						}
						$('.warehouse_select_' + i).select2({
							containerCssClass:"select_box_border",
							templateResult: formatState,
							data: list ,
							placeholder: '请选择库位'
						})
						$('.warehouse_select_' + i).val(self.allInfo.detailList[i].warehousePlaceId).trigger("change")
						$('.warehouse_select_' + i).on("select2:select", function (e) {
							self.allInfo.detailList[i].newWarehouseId = e.params.data.id
						})
					},
					error: function(xhr, type, errorThrown) {
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
			delFile: function(fileId){
				const self = this
				plus.nativeUI.confirm('确定删除？', function(f) {
					if (f.index == 1) {
						self.imagesFiles.forEach((val,index)=>{
							if(val.id==fileId){
								self.imagesFiles.splice(index,1)
							}
						})
					}
				}, '提示', ['取消', '确定']);
			},
			openFile: function(fileId) {
				var filePath = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + fileId + '&token=' + app.getToken();
				// var filePath = app.api_url + 'api/sys/file/download?isOnLine=true&fileId=' + fileId + '&token=' + app.getToken();
				if(app.debug) {
					console.log("RiskfilePath:" + filePath);
				}
				if(m.os.android) {
					plus.runtime.launchApplication({
						pname: "com.tencent.mtt",
						extra: {
							url: filePath
						}
					}, function(e) {
						plus.nativeUI.confirm('当前设备上找不到能打开此附件的应用，是否手动下载并安装相关应用？', function(f) {
							if(f.index == 0) {
								plus.runtime.openURL('http://mb.qq.com');
							} else {

							}
						}, '提示', ['是', '否']);
					});
				} else {
					plus.runtime.openURL(filePath, function(error) {
						m.toast("无法下载和打开此附件，请检查附件地址是否正确");
					}, '');
				}
			},
			openTip: function () { // 打开提示框
				if(!this.activePlateNo){
					m.toast('请先选择车牌号')
					return
				}
				if (this.popoverSure === false) {
					if(this.allNum!=this.workNum){
						this.tipContent='实收数量和应收数量不一致，确认此车已经收货完成了吗？'
					}else{
						this.tipContent = '确认此车已经收货完成了吗？'
					}
					this.popoverSure = true
				} else {
					this.popoverSure = false
				}
			},
			onPlus:function(material){
				// if(material.realNum<material.receivableNum){
					material.realNum = material.realNum+1
				// }else{
				// 	material.realNum = material.receivableNum
				// }
			},
			onSub:function(material){
				if(material.realNum<=0){
					material.realNum = 0
				}else{
					material.realNum = material.realNum-1
				}
			},
			sure: function () { // 确定按钮提交表单
				let self = this
				let data = {}
				data.id = self.allInfo.id || ''
				data.carPlateNos = self.activePlateNo.carPlateNo || ''
				data.idCards = self.activePlateNo.id || ''
				data.phoneNos = self.activePlateNo.phoneNum || ''
				data.driverNames = self.activePlateNo.dirveName || ''
				data.warehouseId = self.allInfo.warehouseId || ''
				data.forecastId = self.allInfo.forecastId || ''
				data.receivingDate = self.allInfo.receivingDate || ''
				data.ownerId = self.allInfo.ownerId || ''
				data.transporterId = self.allInfo.transporterId || ''
				data.transportMode = self.allInfo.transportMode || ''
				data.spenderId = self.allInfo.ownerId || ''
				data.planeCode = self.allInfo.planeCode || ''
				data.downCustomerId = self.allInfo.downCustomerId || ''
				data.paymentMode = self.allInfo.paymentMode || ''
				data.receivingType = self.allInfo.receivingType || ''
				data.initCode = self.allInfo.initCode || ''
				data.contractCode = self.allInfo.detailList.map(e=>e.contractCode||'').join(',')
				data.thickRatio = self.allInfo.detailList.map(e=>e.thickRatio||'').join(',')
				data.detailRemarks = self.allInfo.detailList.map(e=>e.remarks||'').join(',')
				data.counterpoises = self.allInfo.detailList.map(e=>e.counterpoise||'').join(',')
				data.detailIds = self.allInfo.detailList.map(e=>e.id).join(',')
				data.sForecastDetailId = self.allInfo.detailList.map(e=>e.forecastDetailId).join(',')
				data.brandIds = self.allInfo.detailList.map(e=>e.brandId).join(',')
				data.textureIds = self.allInfo.detailList.map(e=>e.textureId).join(',')
				data.specificationIds = self.allInfo.detailList.map(e=>e.specificationId).join(',')
				data.placesteelIds = self.allInfo.detailList.map(e=>e.placesteelId).join(',')
				data.materialDescs = self.allInfo.detailList.map(e=>e.materialDesc).join(',')
				data.receivableNums = self.allInfo.detailList.map(e=>e.receivableNum).join(',')
				data.receivableWeights = self.allInfo.detailList.map(e=>e.receivableWeight).join(',')
				data.realNums = self.allInfo.detailList.map(e=>e.realNum).join(',')
				data.realWeights = self.allInfo.detailList.map(e=>e.realWeight).join(',')
				data.countWeightModes = self.allInfo.detailList.map(e=>e.countWeightMode).join(',')
				data.packageNos = self.allInfo.detailList.map(e=>e.packageNo).join(',')
				data.platformIds = self.allInfo.detailList.map((e)=>{
					if(e.newPlatformId)return e.newPlatformId
					return e.platformId
				}).join(',')
				data.warehousePlaceIds = self.allInfo.detailList.map((e)=>{
					if(e.newWarehouseId)return e.newWarehouseId
					return e.warehousePlaceId
				}).join(',')
				data.isReceiveds = self.allInfo.detailList.map(e=>e.isReceived).join(',')
				data.attacheFileIds_1 = self.imagesFiles.map(e=>e.id).join(',')
				
				let relPath = '/api/proReceiving/save'
				m.ajax(app.api_url + relPath, {
					data: data,
					dataType: 'json', // 服务器返回json格式数据
					type: 'POST', // HTTP请求类型
					timeout: 180000, // 超时时间设置为3分钟
					success: function (data) {
						if(data.status){
							m.back();
						}else{
							m.toast(data.msg)
							return
						}
					},
					error: function(xhr, type, errorThrown) {
						console.log(JSON.stringify(type))
						console.log(JSON.stringify(errorThrown))
						m.toast('网络连接失败，请稍后重试')
					}
				})
			},
		},
		computed: {
			allNum: function () { // 实发总计数量
				let sum = 0
				for (let i in this.allInfo.detailList) {
					if (!this.allInfo.detailList[i].realNum) {
						sum += 0
					} else {
						sum += parseInt(this.allInfo.detailList[i].realNum)
					}
				}
				if (!sum) sum = 0
				return sum
			},
			workNum: function () { // 应发总计数量
				let sum = 0
				for (let i in this.allInfo.detailList) {
					if (!this.allInfo.detailList[i].receivableNum) {
						sum += 0
					} else {
						sum += parseInt(this.allInfo.detailList[i].receivableNum)
					}
				}
				if (!sum) sum = 0
				return sum
			},
		},
	})
	
	$("#addFile").click(function() {
		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: [{
				title: "拍照"
			}, {
				title: "手机相册"
			}]
		}, function(e) {
			if(e.index == 1) {
				cameraJs.capurteImage(function(url) {
					processPicture(url);
				});
			} else if(e.index == 2) {
				cameraJs.galleryImgs(function(e) {
					batchUpload(e.files, function(data) {});
				});
			}
		});
	});
	function processPicture(url) {
		plus.io.resolveLocalFileSystemURL(url, function(entry) {
				// plus.nativeUI.confirm('是否上传？', function(f) {
				// 	if (f.index == 1) {
						compressAndUploadImg(entry);
				// 	} 
				// }, '提示', ['取消', '上传']);
			},
			function(e) {
				m.alert("读取拍照文件错误：" + e.message);
			});
	}
	function compressAndUploadImg(entry) {
		if(app.debug) {
			console.log("compress:" + entry.toLocalURL());
		}
		plus.zip.compressImage({
			src: entry.toLocalURL(),
			dst: '_doc/' + entry.name,
			overwrite: true,
			quality: 100
		}, function(zip) {
			createUpload(zip.target, function(data) {

			});
		}, function(zipe) {
			m.toast('压缩失败！');
		});
	}
	// 创建上传任务
	function createUpload(file, callback) {
		var waiting = plus.nativeUI.showWaiting("图片上传中...", {
			back: 'transmit'
		});
		var fileServer = app.api_url + '/api/sys/file';
		var task = plus.uploader.createUpload(fileServer, {
				method: "POST",
				blocksize: 204800,
				priority: 100,
				timeout: 0
			},
			function(t, status) {
				m.toast('上传成功')
				// 上传完成
				waiting.close();
				if(status == 200) {
					var uf = JSON.parse(t.responseText);
					if(uf.length === 0) {
						console.log("没有上传文件");
						return;
					}
					var newFile = new Object();
					newFile.id = uf[0].fileId;
					newFile.fileExt = 'jpg';
					newFile.fileSize = uf[0].fileSize;
					newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
					newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
					globalVue.imagesFiles.push(newFile)
				} else {
					m.toast('图片上传失败,请重新上传');
				}
				return;
			}
		);
		task.addFile(file, {
			key: "upload"
		});
		task.addData("busiType", "pro_receiving");
		task.start();
	}
	
	function batchUpload(file, callback) {
		var uploadWaiting = plus.nativeUI.showWaiting("图片上传中...", {
			back: 'transmit'
		});
		var task = plus.uploader.createUpload(app.api_url + '/api/sys/file/batchUploadImgs', {
				method: "POST",
				blocksize: 204800,
				priority: 100,
				timeout: 0
			},
			function(t, status) {
				uploadWaiting.close();
				// 上传完成			
				if(status == 200) {
					var uf = JSON.parse(t.responseText);
					if(uf.length === 0) {
						console.log("没有上传文件");
						return;
					}
					m.toast('上传成功');
					var zm = 0;
					setTimeout(showImg, 350);

					function showImg() {
						var newFile = new Object();
						newFile.id = uf[zm].fileId;
						newFile.fileExt = 'jpg';
						newFile.fileSize = uf[zm].fileSize;
						newFile.previewFileUrl = app.api_url + 'api/sys/file/downloadNew?isOnLine=true&fileId=' + newFile.id + '&token=' + app.getToken();
						newFile.fileUrl = app.api_url + '' + 'api/sys/file/downloads?isOnLine=true&isCompress=true&imgWidth=120&imgHeight=120&fileId=' + '' + newFile.id + '&token=' + app.getToken();
						globalVue.imagesFiles.push(newFile)
						callback(t);
						zm++;
						if(zm < uf.length) {
							setTimeout(showImg, 350);
						}
					}
				} else {
					m.toast('图片上传失败,请重新上传');
				}
			}
		);
		for(var i = 0; i < file.length; i++) {
			task.addFile(file[i], {
				key: file[i]
			});
		}
		task.addData("busiType", "pro_receiving");
		task.start();
	}

})