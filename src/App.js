import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 20px;
  border: none;
  background-color: var(--secondary2);
  padding: 10px;
  font-size: 30px;
  font-weight: bold;
  color: var(--secondary2-text);
  width: 300px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 500px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
 
`;

export const StyledPFP = styled.img`
  width: 300px;
  @media (min-width: 767px) {
    width: 500px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
 
`;

export const Styledicon = styled.img`
  display: flex;
  flex: 1;  
  width: 50px;
  padding: 5x;
  flex-direction: column;
  @media (min-width: 767px) {
    width: 50px;
    flex-direction: row;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary-text);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setmintAmount] = useState(1);
  const [freemint, setFreemint] = useState(false);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const getMintedFree = async () => {
    if (blockchain.smartContract !== null){
    let res = await blockchain.smartContract.methods
    .freeMinted(blockchain.account)
    .call();
    console.log(res);
    setFreemint(res);}
  };
  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    if (freemint == false) {
      totalCostWei = String(cost * mintAmount - cost);
    }
    let totalGasLimit = String(gasLimit + mintAmount * 2800);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    console.log(blockchain)
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };
  

  const decrementmintAmount = () => {
    let newmintAmount = mintAmount - 1;
    if (newmintAmount < 1) {
      newmintAmount = 1;
    }
    setmintAmount(newmintAmount);
  };

  const incrementmintAmount = () => {
    let newmintAmount = mintAmount + 1;
    if (newmintAmount > 10) {
      newmintAmount = 10;
    }
    setmintAmount(newmintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <s.Container flex={1} jc={"space-around"} ai={"center"} fd={"row"}  >
        <a href={CONFIG.MARKETPLACE_LINK}>
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        </a>
        <a href={CONFIG.MARKETPLACE_LINK}>
        <Styledicon alt={"OPENSEA"} src={"/config/images/opensea.png"} />
      </a> 
      <a href={CONFIG.TWITTER_LINK}>
        <Styledicon alt={"TWITTER"} src={"/config/images/twitter.png"} />
      </a> 
      </s.Container>
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 2 }} test>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"} >
        <StyledPFP style={{
              backgroundColor: "var(--accent)",
              padding: 2,
              borderRadius: 24,
              border: "2px dashed var(--secondary)",
            }}
            alt={"PFP"} src={"/config/images/pfp.gif"} />
          </s.Container>
          <s.SpacerMedium />
          <s.Container
            flex={1}
            jc={"center"}
            ai={"npcenter"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 4px 11px 2px rgba(0,0,0,0.3)",
            }}
          >            
          <span
          style={{
            textAlign: "center",
          }}
        >
        </span>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                 Sold Out.
                </s.TextTitle>
                <s.SpacerSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on Opensea.
                </s.TextDescription>
                <s.SpacerSmall />
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center",fontSize: 25, color: "var(--accent-text)" }}
                >
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT WALLET
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                     {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementmintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementmintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "MINTING " : "MINT"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
          </s.TextDescription>
        </s.Container>
        <ResponsiveWrapper flex={1} style={{ padding: 2 }} test>
          <s.Container
            flex={1}
            jc={"center"}
            ai={"npcenter"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 22,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 4px 11px 2px rgba(0,0,0,0.2)",
            }}
            > 
            <s.TextDescription style={{ textAlign: "center",fontSize: 25, color: "var(--accent-text)" }}>
            CryptoMax are about to take over the world. 10,000 Maxz are coming to a web3 you love. Get 1 freemint than 0.0029 ETH per one.
                 Max mint 5 per tx.
            </s.TextDescription>
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
          <a href={CONFIG.MARKETPLACE_LINK}>
        <StyledPFP alt={"PFP"} src={"/config/images/4X4.png"} />
        </a>
          </s.Container>  
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
          </s.TextDescription>
        </s.Container>
        <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
        Get Ready for the Takeover… No Discord, No Roadmap, Good Vibes.
        </s.TextDescription>
      </s.Container>
    </s.Screen>
  );
}

export default App;
