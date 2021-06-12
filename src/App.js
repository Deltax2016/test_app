import Web3 from 'web3';
//import { Metamask } from './Utils';
import React, {
    Component
} from "react";

import Table from '@material-ui/core/Table';
import Button from '@material-ui/core/Button';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {
    ChainId,
    Token,
    Fetcher,
    Route,
} from '@uniswap/sdk'

import "./App.css";
const tokenUSDT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const tokenUSDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const tokenDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const tokenETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

function createData(name, balance, rate) {
  return { name, balance, rate };
}

const rows = [];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        isCompleted: 0
    };
}

    componentDidMount = async() => {
      //тут могла бы быть ваша реклама
    };
    

    handleClick = async() => {
        try {

            this.setState({isCompleted: 2});
            const web3 = new Web3(window.ethereum);
            var account = await web3.eth.getAccounts();

            //web3.eth.getAccounts().then();

            let walletAddress = account[0];
            const USDT = new Token(ChainId.MAINNET, tokenUSDT, 6)
            const USDC = new Token(ChainId.MAINNET, tokenUSDC, 6)
            const ETH = new Token(ChainId.MAINNET, tokenETH,18)
            const DAI = new Token(ChainId.MAINNET, tokenDAI, 18)
            
            const duPair = await Fetcher.fetchPairData(DAI, USDT)
            const uuPair = await Fetcher.fetchPairData(USDC, USDT)
            const euPair = await Fetcher.fetchPairData(USDT, ETH)
            const duRoute = new Route([duPair], DAI)
            const uuRoute = new Route([uuPair], USDC)
            const euRoute = new Route([euPair], ETH)
            //console.log(duRoute);

            let priceDAI = duRoute.midPrice.toSignificant(6);
            let priceUSDC = uuRoute.midPrice.toSignificant(6);
            let priceETH = euRoute.midPrice.toSignificant(6);
            console.log(priceDAI);
            console.log(priceUSDC);
            console.log(priceETH);
            //console.log(Math.round(duRoute.midPrice.toSignificant(6))); 
            //console.log(Math.round(uuRoute.midPrice.toSignificant(6)));

            let ABI = [
                // balanceOf
                {
                    "constant": true,
                    "inputs": [{
                        "name": "_owner",
                        "type": "address"
                    }],
                    "name": "balanceOf",
                    "outputs": [{
                        "name": "balance",
                        "type": "uint256"
                    }],
                    "type": "function"
                },
            ];
            // Get ERC20 Token contract instance
            let contractDAI = new web3.eth.Contract(ABI, tokenDAI);
            let contractUSDC = new web3.eth.Contract(ABI, tokenUSDC);
            let contractETH = new web3.eth.Contract(ABI, tokenETH);
            async function getBalance() {
                let balanceDAI = await contractDAI.methods.balanceOf(walletAddress).call();
                let balanceUSDC = await contractUSDC.methods.balanceOf(walletAddress).call();
                let balanceETH= await contractETH.methods.balanceOf(walletAddress).call();
                return [balanceDAI,balanceUSDC,balanceETH];
            }
            await getBalance().then(function(result) {
                console.log(result);
                rows.push(createData('ETH',result[2],priceETH));
                rows.push(createData('USDC',result[1],priceUSDC));
                rows.push(createData('DAI',result[0],priceDAI));
                
            });

            console.log(rows)
            this.setState({isCompleted: 1});
            

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Парниша, а метамаск кто включать будет?`,
            );
            console.error(error);
        }
    }

    render() {
        if (!this.state.web3) {
          //const classes = useStyles();
            return (
    <div>
    <h1>{this.state.isCompleted ? 'Metamask status: Connected' : 'Metamask status: Disconnected' }</h1>
    {!this.state.isCompleted &&
    <Button align="center" variant="outlined" color="primary" onClick={this.handleClick}>Conect to Metamask</Button>
   }
    {this.state.isCompleted == 2 &&
    <h1>Ждём-с..</h1>}
    {this.state.isCompleted == 1 && 
    <TableContainer component={Paper} >
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Монета</TableCell>
            <TableCell align="center">Мой баланс</TableCell>
            <TableCell align="center">Средний курс (USD)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell align="center">
                {row.name}
              </TableCell>
              <TableCell align="center">{row.balance}</TableCell>
              <TableCell align="center">{row.rate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>}
    </div>
              );
        }
    }
}

export default App;