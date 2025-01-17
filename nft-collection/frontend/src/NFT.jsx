import React, { useState } from "react";
import ABI from "./contracts/ABI.json";
import { useAccount, useContract, useContractRead, useSigner } from "wagmi";
import { NFTStorage } from "nft.storage";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = "0x387b08E96cb9E6D056a391AFD7547aEaaBf0729f";

const NFT_STORAGE_KEY = import.meta.env.VITE_NFT_STORAGE_KEY;

const NFT = () => {
	const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
	const [isMinting, setIsMinting] = useState(false);

	const navigate = useNavigate();

	const { address } = useAccount();

	const { data: signer } = useSigner();

	const contract = useContract({
		address: CONTRACT_ADDRESS,
		abi: ABI.abi,
		signerOrProvider: signer,
	});

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const client = new NFTStorage({ token:  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNEODhDMjZkYjFiNmVhODY1Yjk2MGE1MjExQzhGMjUwNkUxZDdiQ2UiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3OTIyNjczNzY1NSwibmFtZSI6ImJ1aWRsIn0.H0eoI8vkXyCQ4vNPejJatXcpXX_QAd8YwhuvINFU7HI" });

	const changeHandler = event => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
	};

	const handleTitleChange = event => {
		setTitle(event.target.value);
	};

	const handleDescriptionChange = event => {
		setDescription(event.target.value);
	};

	const { data: supply } = useContractRead({
		address: CONTRACT_ADDRESS,
		abi: ABI.abi,
		functionName: "totalSupply",
	});

	const uploadFile = () => {
		setIsMinting(true);
		client
			.store({
				name: title,
				description,
				image: selectedFile,
			})
			.then(result => {
				const ipfsUrl = result.url;
				console.log("IPFS url:", ipfsUrl);
				try {
					contract.safeMint(address, ipfsUrl).then(res => {
						console.log(
							"Minted Successfully: https://mumbai.polygonscan.com/tx/" +
								res.hash
						);
						setIsMinting(false);
						navigate(`/gallery/${supply.toNumber()}`);
					});
				} catch (e) {
					console.log(e);
				}
			})
			.catch(error => {
				console.error("Error:", error);
				setIsMinting(false);
			});
	};
	return (
		<div className="NFT__Container">
			{isFilePicked ? (
				<div className="File__Container">
					{selectedFile && (
						<img src={URL.createObjectURL(selectedFile)}></img>
					)}
					<div className="File__Metadata">
						<p>
							<label>Filename:</label> {selectedFile.name}
						</p>
						<p>
							<label>Size:</label>{" "}
							{Math.round(selectedFile.size / 1024)} kb
						</p>
					</div>
				</div>
			) : (
				<h2>Select a file to create NFT</h2>
			)}
			{isFilePicked && (
				<>
					<div className="Divider" />
					<div className="Input__Wrapper">
						<div className="Input__Container">
							<label>Title</label>
							<input
								type="text"
								name="title"
								placeholder="e.g. The Digital Masterpiece"
								onChange={handleTitleChange}
							/>
						</div>
						<div className="Input__Container">
							<label>Description</label>
							<input
								type="text"
								name="description"
								placeholder="e.g. Stunning Fusion of Art and Technology"
								onChange={handleDescriptionChange}
							/>
						</div>
					</div>
					<div className="Divider" />
				</>
			)}
			<div className="Buttons__Container">
				<input
					accept="image/png, image/jpeg, image/gif"
					type="file"
					name="file"
					onChange={changeHandler}
				/>
				{isFilePicked && (
					<button
						disabled={isMinting}
						className="btn"
						onClick={uploadFile}
					>
						{isMinting ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								width="24"
								height="24"
								viewBox="0 0 100 100"
								preserveAspectRatio="xMidYMid"
							>
								<circle
									cx="50"
									cy="50"
									fill="none"
									stroke="currentColor"
									strokeWidth="8"
									r="35"
									strokeDasharray="164.93361431346415 56.97787143782138"
								>
									<animateTransform
										attributeName="transform"
										type="rotate"
										repeatCount="indefinite"
										dur="1s"
										values="0 50 50;360 50 50"
										keyTimes="0;1"
									></animateTransform>
								</circle>
							</svg>
						) : (
							"Create NFT"
						)}
					</button>
				)}
			</div>
		</div>
	);
};

export default NFT;
