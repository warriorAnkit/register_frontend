
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
// import { FileImageOutlined, FilePdfOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
// import { Upload, message,Modal } from 'antd';
// import React, { useEffect, useState } from 'react';
// import { useMutation } from '@apollo/client'; // For calling the mutation

// // Import the GraphQL mutation for generating signed URL
// import { GENERATE_SIGNED_URL } from '../graphql/Mutation'; // Update with correct path to mutation

// const ImageUpload = ({ onUploadSuccess, errorMessage, existingFileUrls }) => {
//   const [loading, setLoading] = useState(false);
//   const [uploadedFileUrls, setUploadedFileUrls] = useState(existingFileUrls || ''); // Store as string
//   const [fileType, setFileType] = useState(null);
//   const [isFileLimitExceeded, setIsFileLimitExceeded] = useState(false);
//   // Use the GraphQL mutation to get the signed URL
//   const [generateSignedUrl] = useMutation(GENERATE_SIGNED_URL);
// console.log("ankit",existingFileUrls);
//   useEffect(() => {
//     if (existingFileUrls && existingFileUrls.length > 0) {
//       setUploadedFileUrls(existingFileUrls);
//     } else {
//       setUploadedFileUrls('');
//     }
//   }, [existingFileUrls]);

//   const handleFileUpload = async (file) => {
//     setLoading(true);
//     const fileName = `uploads/${Date.now()}_${file.name}`;
//     const fileMimeType = file.type;
//     setFileType(fileMimeType);

//     try {
//       // Call the mutation to get the signed URL

//       const { data } = await generateSignedUrl({ variables: { filename: fileName, fileType: fileMimeType } });
//       const { signedUrl } = data.generateSignedUrl;
//       if (!signedUrl) {
//         throw new Error('Failed to retrieve signed URL');
//       }

//       if (signedUrl) {
//         // Upload the file to Google Cloud Storage using the signed URL
//         const response = await fetch(signedUrl, {
//                     method: 'PUT',
//                     body: file,
//                     headers: {
//                       'Content-Type': fileMimeType,
//                     },
//                   });
// console.log(response.ok);
// if (response.ok) {
//   message.success('File uploaded successfully');
//   console.log("ddankit",fileName);
//   const updatedUrls = uploadedFileUrls ? `${uploadedFileUrls},${fileName}` : fileName;
//   setUploadedFileUrls(updatedUrls);
//   onUploadSuccess(updatedUrls);
// } else {
//   const errorText = await response.text();
//   console.error('File upload failed:', response.status, errorText);
//   throw new Error(`Upload failed with status ${response.status}`);
// }
//       }
//     } catch (error) {
//       console.log("eris",error);
//       message.error('File upload failed');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Custom request for file upload
//   const customRequest = ({ file, onSuccess, onError }) => {
//     handleFileUpload(file)
//       .then((fileName) => {
//         onSuccess(fileName);
//       })
//       .catch((error) => {
//         onError(error);
//       });
//   };

//   // Validate file before upload (image or PDF, max 5MB)
//   const beforeUpload = (file,fileList) => {
//     const isImage = file.type.startsWith('image/');
//     const isPDF = file.type === 'application/pdf';
//     const isValidSize = file.size / 1024 / 1024 < 5; // Limit file size to 5MB
//     // const totalFiles = uploadedFileUrls.split(',').length + fileList.length;
//     if (fileList.findIndex(f => f === file) > 2) {
//      setIsFileLimitExceeded(true);
//       return Upload.LIST_IGNORE; // Prevent upload of additional files
//     }


//     // Check all files in the current batch

//     if (!isImage && !isPDF) {
//       message.error('You can only upload image or PDF files!');
//       return Upload.LIST_IGNORE;
//     }

//     if (!isValidSize) {
//       message.error('File must be smaller than 5MB!');
//       return Upload.LIST_IGNORE;
//     }

//     return true;
//   };

//   const handleRemoveFile = (fileName) => {
//     setUploadedFileUrls((prevUrls) => {
//       const updatedUrls = prevUrls
//         .split(',')
//         .filter((url) => url !== fileName)
//         .join(',');

//       onUploadSuccess(updatedUrls);
//       return updatedUrls;
//     });
//     console.log("gdsvgfedg",uploadedFileUrls);

//   };
//   const showLimitExceededModal = () => {
//     if (isFileLimitExceeded) {
//       Modal.info({
//         title: 'File Limit Exceeded',
//         content: 'You can only upload up to 3 files at a time.',
//         onOk() {
//           setIsFileLimitExceeded(false); // Reset the variable after modal is closed
//         },
//       });
//     }
//   };

//   useEffect(() => {
//     showLimitExceededModal();
//   }, [isFileLimitExceeded]);
//   return (
//     <div>
//       {uploadedFileUrls.length > 0 && (
//         <div style={{ marginTop: 16, textAlign: 'center' }}>
//           {uploadedFileUrls.split(',').map((fileName, index) => {
//             console.log("qwerty",uploadedFileUrls);
//             const fileUrl = `https://storage.googleapis.com/digiqc_register/${fileName}`;
//             const ext = fileName.split('.').pop().toLowerCase();
//             const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
//             return (
//               // eslint-disable-next-line react/no-array-index-key
//               <div key={index} style={{ position: 'relative', display: 'inline-block', margin: '8px' }}>
//                 {isImage ? (
//                   <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />
//                 ) : (
//                   <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
//                 )}
//                 <div>
//                   <a
//                     href={fileUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{ textDecoration: 'none', color: 'inherit' }}
//                   >
//                     Open File
//                   </a>
//                 </div>
//                 <CloseCircleOutlined
//                   style={{
//                     position: 'absolute',
//                     top: '5px',
//                     right: '5px',
//                     color: 'red',
//                     cursor: 'pointer',
//                   }}
//                   onClick={() => handleRemoveFile(fileName)}
//                 />
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {uploadedFileUrls.split(',').length < 4 && (

//         <Upload
//           customRequest={customRequest}
//           showUploadList
//           accept="image/*,.pdf"
//           beforeUpload={beforeUpload}
//           multiple
//           maxCount={3 - uploadedFileUrls.split(',').length}
//           onChange={(info) => {
//             const { fileList } = info;
//             console.log("ankit list",fileList);
//             if (fileList.length > 3) {
//               // Display an error message if more than 3 files are selected
//               message.error("You can only upload up to 3 files.");
//               return false;  // Prevent adding more files
//             }
//           }}
//         >
//           <div style={{ display: 'flex', justifyContent: 'center' }}>
//             <PlusOutlined />
//             <div style={{ marginTop: 8 }}>Upload Image or PDF</div>
//           </div>
//         </Upload>
//       )}

//       {loading && <div>Uploading...</div>}

//       {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
//     </div>
//   );
// };

// export default ImageUpload;
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { FileImageOutlined, FilePdfOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Upload, message,Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client'; // For calling the mutation

// Import the GraphQL mutation for generating signed URL
import { GENERATE_SIGNED_URL } from '../graphql/Mutation'; // Update with correct path to mutation

const ImageUpload = ({ onUploadSuccess, errorMessage, existingFileUrls }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFileUrls, setUploadedFileUrls] = useState(existingFileUrls || ''); // Store as string
  const [fileType, setFileType] = useState(null);
  const [isFileLimitExceeded, setIsFileLimitExceeded] = useState(false);
  // Use the GraphQL mutation to get the signed URL
  const [generateSignedUrl] = useMutation(GENERATE_SIGNED_URL);

  useEffect(() => {
    if (existingFileUrls && existingFileUrls.length > 0) {
      setUploadedFileUrls(existingFileUrls);
    } else {
      setUploadedFileUrls('');
    }
  }, [existingFileUrls]);

  const handleFileUpload = async (file) => {
    setLoading(true);
    const fileName = `uploads/${Date.now()}_${file.name}`;
    const fileMimeType = file.type;
    setFileType(fileMimeType);

    try {
      // Call the mutation to get the signed URL
      const { data } = await generateSignedUrl({ variables: { filename: fileName, fileType: fileMimeType } });
      const { signedUrl } = data.generateSignedUrl;

      if (signedUrl) {
        // Upload the file to Google Cloud Storage using the signed URL
        const response = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (response.ok) {
          message.success('File uploaded successfully');

          setUploadedFileUrls((prevUrls) => {
            const updatedUrls = prevUrls ? `${prevUrls},${fileName}` : fileName;
            onUploadSuccess(updatedUrls);
            return updatedUrls;
          });

          setFileType(file.type);

        } else {
          throw new Error('File upload failed');
        }
      }
    } catch (error) {
      message.error('File upload failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Custom request for file upload
  const customRequest = ({ file, onSuccess, onError }) => {
    handleFileUpload(file)
      .then((fileName) => {
        onSuccess(fileName);
      })
      .catch((error) => {
        onError(error);
      });
  };

  // Validate file before upload (image or PDF, max 5MB)
  const beforeUpload = (file,fileList) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isValidSize = file.size / 1024 / 1024 < 5; // Limit file size to 5MB
    // const totalFiles = uploadedFileUrls.split(',').length + fileList.length;
    if (fileList.findIndex(f => f === file) > 2) {
     setIsFileLimitExceeded(true);
      return Upload.LIST_IGNORE; // Prevent upload of additional files
    }


    // Check all files in the current batch

    if (!isImage && !isPDF) {
      message.error('You can only upload image or PDF files!');
      return Upload.LIST_IGNORE;
    }

    if (!isValidSize) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleRemoveFile = (fileName) => {
    setUploadedFileUrls((prevUrls) => {
      const updatedUrls = prevUrls
        .split(',')
        .filter((url) => url !== fileName)
        .join(',');
        onUploadSuccess(updatedUrls);
      return updatedUrls;
    });
  };
  const showLimitExceededModal = () => {
    if (isFileLimitExceeded) {
      Modal.info({
        title: 'File Limit Exceeded',
        content: 'You can only upload up to 3 files at a time.',
        onOk() {
          setIsFileLimitExceeded(false); // Reset the variable after modal is closed
        },
      });
    }
  };

  useEffect(() => {
    showLimitExceededModal();
  }, [isFileLimitExceeded]);
  return (
    <div>
      {uploadedFileUrls.length > 0 && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {uploadedFileUrls.split(',').map((fileName, index) => {
            const fileUrl = `https://storage.googleapis.com/digiqc_register/${fileName}`;
            const ext = fileName.split('.').pop().toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} style={{ position: 'relative', display: 'inline-block', margin: '8px' }}>
                {isImage ? (
                  <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                ) : (
                  <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                )}
                <div>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    Open File
                  </a>
                </div>
                <CloseCircleOutlined
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    color: 'red',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleRemoveFile(fileName)}
                />
              </div>
            );
          })}
        </div>
      )}

      {uploadedFileUrls.split(',').length < 3 && (
        <Upload
          customRequest={customRequest}
          showUploadList={false}
          accept="image/*,.pdf"
          beforeUpload={beforeUpload}
          multiple
          maxCount={3 - uploadedFileUrls.split(',').length}
          onChange={(info) => {
            const { fileList } = info;

            if (fileList.length > 3) {
              // Display an error message if more than 3 files are selected
              message.error("You can only upload up to 3 files.");
              return false;  // Prevent adding more files
            }

          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload Image or PDF (Max size: 5MB)</div>
          </div>
        </Upload>
      )}

      {loading && <div>Uploading...</div>}

      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </div>
  );
};

export default ImageUpload;