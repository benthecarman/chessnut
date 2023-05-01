import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";
import { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function QrScannerModal({
  isOpen,
  onClose,
  onData,
  header,
}: { onData: (text: string) => void; header?: string } & Pick<
  ModalProps,
  "isOpen" | "onClose"
>) {
  const [stopStream, setStopStream] = useState(false);
  const handleClose = () => {
    // Stop the QR Reader stream (fixes issue where the browser freezes when closing the modal) and then dismiss the modal one tick later
    setStopStream(true);
    setTimeout(() => onClose(), 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header ?? "Scan QR code"}</ModalHeader>
        <ModalBody py="0">
          <BarcodeScannerComponent
            stopStream={stopStream}
            onUpdate={(err, result) => {
              if (result && result.getText()) {
                handleClose();
                // wait for steam to be stopped before returning data
                setTimeout(() => onData(result.getText()), 0);
              }
            }}
          />
        </ModalBody>

        <ModalFooter>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
