/***
@controller Name:ui.s2p.mm.transfer.stock.crossplant.controller.S1,
*@viewId:application-adaptationproject-display-component---S1
*/
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
		'sap/ui/core/mvc/ControllerExtension',
		'ui/s2p/mm/transfer/stock/crossplant/controller/S1.controller'
		// ,'sap/ui/core/mvc/OverrideExecution'
	],
	function (
		ControllerExtension, S1Controller
		// ,OverrideExecution
	) {
		"use strict";
		const originalPrototype = Object.assign({}, S1Controller.prototype);

		S1Controller.prototype._updateSTOPostButton = function (sTargetStorageLocation) {
			var sJsonPopup = this._getPostModel().getData();
			if (sJsonPopup.StartStorageLocationStockType !== "CurrentStock" || sJsonPopup.TargetStorageLocationStockType !== "CurrentStock" ||
				this._NumberOfAttachments > 0 //Attachments --> Not supported by STO posting
				//|| sJsonPopup.SerialNumbersVisible // serial numbers not supported by STO posting
				|| sJsonPopup.StartSpecialStockType !== "") { // special stock not supported by STO posting
				sJsonPopup.STOButtonVisible = false;
				sJsonPopup.PlannedDeliveryDateVisible = false;
				sJsonPopup.RecalculateButtonVisible = false;
			} else { //Check backend authorsation

				if (this._StockTransferPerSupplyingPlantBuffer[sJsonPopup.StartPlant] && this._StockTransferPerSupplyingPlantBuffer[sJsonPopup.StartPlant]
				[sJsonPopup.TargetPlant] && this._StockTransferPerSupplyingPlantBuffer[sJsonPopup.StartPlant]
				[sJsonPopup.TargetPlant][sTargetStorageLocation] !== undefined) {
					if (this._StockTransferPerSupplyingPlantBuffer[sJsonPopup.StartPlant]
					[sJsonPopup.TargetPlant][sTargetStorageLocation].Allowed === true) { //STO allowed
						sJsonPopup.STOButtonEnabled = true;
						sJsonPopup.STOButtonVisible = true;
						sJsonPopup.PlannedDeliveryDateVisible = true;
						sJsonPopup.PlannedDeliveryDateEnabled = true;
						if (this._oPersonalizedDataContainer.bPredictiveModelIsActive && this._oPersonalizedDataContainer.PresetUsePredictiveModel) {
							sJsonPopup.RecalculateButtonVisible = true;
						}
						sJsonPopup.STOButtonName = this.getResourceBundle().getText("STO_BUTTON_DEFAULT_NAME");
						sJsonPopup.STOButtonName = this.getResourceBundle().getText("BUTTON_CREATE", [sJsonPopup.STOButtonName]);
						sJsonPopup.PlannedDeliveryDate = this._StockTransferPerSupplyingPlantBuffer[sJsonPopup.StartPlant]
						[sJsonPopup.TargetPlant][sTargetStorageLocation].PredictedDeliveryDate;
					} else {
						sJsonPopup.STOButtonEnabled = false;
						sJsonPopup.STOButtonVisible = true;
						sJsonPopup.PlannedDeliveryDateVisible = true;
						sJsonPopup.PlannedDeliveryDateEnabled = false;
						sJsonPopup.STOButtonName = this.getResourceBundle().getText("STO_BUTTON_DEFAULT_NAME");
						sJsonPopup.STOButtonName = this.getResourceBundle().getText("BUTTON_CREATE", [sJsonPopup.STOButtonName]);
						if (this._oPersonalizedDataContainer.bPredictiveModelIsActive && this._oPersonalizedDataContainer.PresetUsePredictiveModel) {
							sJsonPopup.RecalculateButtonVisible = false;
						}
					}
				} else { //--> New 
					sJsonPopup.STOButtonVisible = true;
					sJsonPopup.STOButtonEnabled = false;
					sJsonPopup.PlannedDeliveryDateVisible = true;
					sJsonPopup.PlannedDeliveryDateEnabled = false;
					sJsonPopup.STOButtonName = this.getResourceBundle().getText("STO_BUTTON_DEFAULT_NAME");
					sJsonPopup.STOButtonName = this.getResourceBundle().getText("BUTTON_CREATE", [sJsonPopup.STOButtonName]);
					//read from backend
					//get plant authorisation
					this.getOwnerComponent().getModel("oSTO").callFunction("/AuthorityCheckSTO", {
						method: "GET",
						urlParameters: {
							Application: "CrossTransfer",
							ReceivingPlant: sJsonPopup.TargetPlant,
							Material: this.getModel("oFrontend").getProperty("/Material"),
							SupplyingPlant: sJsonPopup.StartPlant,
							ReceivingStorageLocation: sTargetStorageLocation,
							OrderedQuantity: sJsonPopup.Quantity,
							OrderedQuantityUnit: sJsonPopup.Unit,
							UsePredictive: this._oPersonalizedDataContainer.PresetUsePredictiveModel
						},
						success: jQuery.proxy(this._successSTOAuthorisationLoad, this, sJsonPopup.StartPlant, sJsonPopup.TargetPlant,
							sTargetStorageLocation),
						error: jQuery.proxy(this._handleOdataError, this)
					});

				}
			}

			this._getPostModel().setData(sJsonPopup);
		}
		return ControllerExtension.extend("customer.ztransfertstock.zTransfertStockExt", {
			// metadata: {
			// 	// extension can declare the public methods
			// 	// in general methods that start with "_" are private
			// 	methods: {
			// 		publicMethod: {
			// 			public: true /*default*/ ,
			// 			final: false /*default*/ ,
			// 			overrideExecution: OverrideExecution.Instead /*default*/
			// 		},
			// 		finalPublicMethod: {
			// 			final: true
			// 		},
			// 		onMyHook: {
			// 			public: true /*default*/ ,
			// 			final: false /*default*/ ,
			// 			overrideExecution: OverrideExecution.After
			// 		},
			// 		couldBePrivate: {
			// 			public: false
			// 		}
			// 	}
			// },

			// // adding a private method, only accessible from this controller extension
			// _privateMethod: function() {},
			// // adding a public method, might be called from or overridden by other controller extensions as well
			// publicMethod: function() {},
			// // adding final public method, might be called from, but not overridden by other controller extensions as well
			// finalPublicMethod: function() {},
			// // adding a hook method, might be called by or overridden from other controller extensions
			// // override these method does not replace the implementation, but executes after the original method
			// onMyHook: function() {},
			// // method public per default, but made private via metadata
			// couldBePrivate: function() {},
			// // this section allows to extend lifecycle hooks or override public methods of the base controller
			// override: {
			// 	/**
			// 	 * Called when a controller is instantiated and its View controls (if available) are already created.
			// 	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			// 	 * @memberOf customer.ztransfertstock.zTransfertStockExt
			// 	 */
			//	onInit: function() {
			 //	},

			// 	/**
			// 	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			// 	 * (NOT before the first rendering! onInit() is used for that one!).
			// 	 * @memberOf customer.ztransfertstock.zTransfertStockExt
			// 	 */
			// 	onBeforeRendering: function() {
			// 	},

			// 	/**
			// 	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			// 	 * This hook is the same one that SAPUI5 controls get after being rendered.
			// 	 * @memberOf customer.ztransfertstock.zTransfertStockExt
			// 	 */
			// 	onAfterRendering: function() {
			// 	},

			// 	/**
			// 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			// 	 * @memberOf customer.ztransfertstock.zTransfertStockExt
			// 	 */
			// 	onExit: function() {
			// 	},

			// 	// override public method of the base controller
			// 	basePublicMethod: function() {
			// 	}
			// }
		});
	});