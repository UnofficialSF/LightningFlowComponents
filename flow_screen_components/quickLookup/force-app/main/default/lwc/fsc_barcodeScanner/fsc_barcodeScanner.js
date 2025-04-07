import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class fsc_barcodeScanner extends LightningElement {
  barcodeScanner;
  scannerDisabled = false;
  @track barcodeScannedValue;
  @api
  get barcodeScanned() {
    return this.barcodeScannedValue;
  }
  set barcodeScanned(value) {
    this.barcodeScannedValue = value;
  }

  connectedCallback() {
    this.barcodeScanner = getBarcodeScanner();
    if (this.barcodeScanner == null || !this.barcodeScanner.isAvailable()) {
      this.scannerDisabled = true;
    }
  }

  handleBeginScanClick() {
    const scanningOptions = {
      scannerSize: 'XLARGE',
      cameraFacing: 'BACK',
      showSuccessCheckMark: true,
      vibrateOnSuccess: true,
      manualConfirmation: true,
      previewBarcodeData: true,
      enableBulkScan: false,
      enableMultiScan: false
    };

    this.barcodeScannedValue = '';
    if (this.barcodeScanner != null && this.barcodeScanner.isAvailable()) {
      this.barcodeScanner
        .scan(scanningOptions)
        .then((result) => {
          this.handleScannedBarcodes(result);
        })
        .catch((error) => {
          this.handleError(error);
        })
        .finally(() => {
          this.barcodeScanner.dismiss();
        });
    } else {
      this.showToast('Barcode Scanner Is Not Available', 'Try again from the Salesforce app on a mobile device.', 'error', 'sticky');
    }
  }

  handleScannedBarcodes(barcode) {
    console.log(JSON.stringify(barcode));
    if (barcode && barcode.length > 0) {
      const value = barcode[0]?.value; //decodeURIComponent
      this.barcodeScannedValue = value;
      this.dispatchEvent(new CustomEvent('scansuccess', { detail: { value } }));

      this.dispatchEvent(new CustomEvent('notifychange', { detail: { value: value } }));

      const attributeChangeEvent = new FlowAttributeChangeEvent('barcodeScanned', value);
      this.dispatchEvent(attributeChangeEvent);
    }
  }

  showToast(title, message, variant, mode) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
        mode: mode
      })
    );
  }

  handleError(error) {
    this.dispatchEvent(new CustomEvent('scanerror', { detail: error }));

    this.showToast('Barcode Scanner Error', JSON.stringify(error), 'error', 'sticky');
  }
}