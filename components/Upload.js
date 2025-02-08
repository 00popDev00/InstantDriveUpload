import { useState, useRef, useEffect } from "react";

export default function Upload() {
  const [fileName, setFileName] = useState(""); // Store the file name
  const [uploading, setUploading] = useState(false);
  const [uploadedLink, setUploadedLink] = useState("");
  const [capturedImage, setCapturedImage] = useState(null); // Store captured image
  const [isCamera, setIsCamera] = useState(null); // Store if the user is in camera or file mode
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const videoRef = useRef(null); // Reference to the video element
  const canvasRef = useRef(null); // Reference to the canvas element
  const fileInputRef = useRef(null); // Reference to the file input

  // Start video feed from camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? "user" : "environment", // Default: Back Camera
        },
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  // Capture image from video feed
  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/png");
      setCapturedImage(imageUrl);
    } else {
      console.error("Canvas is not ready yet!"); // Log if canvas context is still unavailable
    }
  };

  // Handle file upload from input
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result); // Store the file as the image
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload of captured or selected image
  const handleUpload = async () => {
    if (!capturedImage || !fileName) {
      return alert(
        "Please capture an image or select a file and provide a file name."
      );
    }

    setUploading(true);
    const formData = new FormData();
    const blob = dataURLToBlob(capturedImage);
    formData.append("file", blob, `${fileName}.png`); // Upload the captured image with custom name

    let response = null;

    let retry = 0;

    do {
      response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      retry++;
    } while (!response.ok && retry < 5);

    const data = await response.json();
    if (response.ok) setUploadedLink(data.googleDriveLink);
    else alert(data.error);

    setUploading(false);
  };

  // Convert data URL to Blob for image upload
  const dataURLToBlob = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  };

  // Handle toggling of camera
  useEffect(() => {
    if (isCamera) {
      startCamera();
    }
  }, [isCamera, isFrontCamera]);

  useEffect(() => {
    if (isCamera === true) {
      startCamera();
    } else {
      // Stop the camera stream if the user switches to file upload
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }
  }, [isCamera]);

  return (
    <div className="container">
      {/* Initial Selection of Camera or File Upload */}
      {isCamera === null && (
        <div className="select-option">
          <button onClick={() => setIsCamera(true)} className="button">
            Capture Image (Camera)
          </button>
          <button onClick={() => setIsCamera(false)} className="button">
            Upload Image (File)
          </button>
        </div>
      )}

      {/* Camera Section */}
      {isCamera === true && (
        <div className="camera-upload-section">
          <button onClick={() => setIsCamera(null)} className="button">
            Back
          </button>
          {!capturedImage && (
            <>
              <video
                ref={videoRef}
                width="100%"
                height="auto"
                autoPlay
                style={{ border: "1px solid #ccc", borderRadius: "8px" }}
              ></video>
              <button onClick={captureImage} className="button capture-btn">
                Capture Image
              </button>
              <button
                onClick={() => setIsFrontCamera((prev) => !prev)}
                className="button flip-btn"
              >
                Flip Camera
              </button>
              <canvas
                ref={canvasRef}
                width="640"
                height="480"
                style={{ display: "none" }}
              />
            </>
          )}

          {/* Show the "Re-capture" option */}
          {capturedImage && (
            <div className="preview-section">
              <h3>Preview</h3>
              <img
                src={capturedImage}
                alt="Captured Preview"
                className="preview-img"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                }}
              />
              <button
                onClick={() => {
                  setCapturedImage(null);
                  canvasRef.files = null;
                  startCamera(); // Restart the camera feed
                }}
                className="button recapture-btn"
              >
                Re-capture
              </button>

              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="file-name-input"
              />

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="button upload-btn"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* File Upload Section */}
      {isCamera === false && (
        <div className="file-upload-section">
          <button onClick={() => setIsCamera(null)} className="button">
            Back
          </button>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            className="file-name-input"
          />
          <input
            type="file"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="file-upload-input"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="button upload-btn"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      )}

      {/* Upload Result */}
      {uploadedLink && (
        <p>
          Uploaded:{" "}
          <a href={uploadedLink} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </p>
      )}
    </div>
  );
}
