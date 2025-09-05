import { useState, useEffect } from "react";
import styles from "./MintSuccessModal.module.css";

interface Metadata {
  id: number;
  title: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes?: string;
  collection_name?: string;
  collection_address?: string;
}

interface MintSuccessModalProps {
  onClose: () => void;
  nftData: Metadata;
}

const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  onClose,
  nftData,
}) => {
  const [isOpening, setIsOpening] = useState<boolean>(true);
  const [showContents, setShowContents] = useState<boolean>(false);

  // Animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpening(false);
      setShowContents(true);
    }, 2000); // Animation duration

    return () => clearTimeout(timer);
  }, []);

  // Tweet content
  const tweetText = `🚀 Just minted my NFT "${nftData.title}"! Check it out at ${nftData.image_url} #NFTCommunity #Web3`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {isOpening ? (
          <div className={styles.lotteryAnimation}>
            <div className={styles.box}>
              <div className={styles.boxLid}></div>
              <div className={styles.boxBody}>
                <div className={styles.shine}></div>
              </div>
            </div>
            <div className={styles.sparkles}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className={styles.sparkle}></div>
              ))}
            </div>
            <p className={styles.openingText}>Your NFT is being revealed...</p>
          </div>
        ) : showContents ? (
          <div className={styles.successContent}>
            <h2>Congratulations!</h2>
            <p>You&apos;ve successfully minted:</p>
            <h3>{nftData.title}</h3>
            {nftData.image_url && (
              <div className={styles.nftImage}>
                <img src={nftData.image_url} alt={nftData.title} />
              </div>
            )}
            <div className={styles.tweetSection}>
              <p>Share your new NFT with the world!</p>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tweetButton}
              >
                Tweet about it
              </a>
            </div>
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MintSuccessModal;
