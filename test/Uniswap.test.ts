import {expect} from './_chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUsers, setupUser} from './utils';
import {swapExactETHForTokens} from './helpers/uniswap-functions';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {DAI, UniswapV2Router02, USDC} from '@dethcrypto/eth-sdk-client/types';

const setup = deployments.createFixture(async () => {
  // Accounts & Forked Contract(s) Setup
  const {superUser} = await getNamedAccounts();

  const _Contracts = getMainnetSdk(ethers.provider.getSigner());

  const WETH = _Contracts.Tokens.WETH;
  const UniswapV2Router02 = _Contracts.DeFi.UniswapV2.UniswapV2Router02
  const DAI = _Contracts.Tokens.DAI;
  const USDC = _Contracts.Tokens.USDC;

  const contracts = {
    UniswapV2Router02,
    WETH,
    DAI,
    USDC,
  };

  const users = {
    unnamedUsers: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };

  return {
    ...contracts,
    ...users
  };
});

describe('Uniswap', function () {

  let _UniswapV2Router02: UniswapV2Router02;
  let _DAI: DAI;
  let _USDC: USDC;

  it('superUser initial balance of 1000 ETH', async () => {
    const {superUser, USDC, DAI, UniswapV2Router02} = await setup();
    _UniswapV2Router02 = UniswapV2Router02;
    _USDC = USDC;
    _DAI = DAI;

    const ethBalanceWei = await ethers.provider.getBalance(superUser.address);
    const ethBalance = ethers.utils.formatEther(ethBalanceWei);
    expect(parseFloat(ethBalance)).to.equal(10000);
  });
  it('superUser initial balance of 0 DAI', async () => {
    const {superUser} = await setup();
    const daiBalanceWei = await _DAI.balanceOf(superUser.address);
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18);
    expect(parseFloat(daiBalance)).to.equal(0);
  });
  it('superUser initial balance of 0 USDC', async () => {
    const {superUser} = await setup();
    const usdcBalanceWei = await _USDC.balanceOf(superUser.address);
    const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 18);
    expect(parseFloat(usdcBalance)).to.equal(0);
  });
  it('Swap ETH for DAI', async function () {
    const {superUser} = await setup();
    await swapExactETHForTokens(_UniswapV2Router02, 1, _DAI, superUser.address);
    const daiBalanceWei = await _DAI.balanceOf(superUser.address);
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18);
    expect(parseFloat(daiBalance)).to.be.greaterThan(0);
  });
  it('Swap ETH for USDC', async function () {
    const {superUser} = await setup();
    await swapExactETHForTokens(_UniswapV2Router02, 1, _USDC, superUser.address);
    const usdcBalanceWei = await _USDC.balanceOf(superUser.address);
    const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 6);
    expect(parseFloat(usdcBalance)).to.be.greaterThan(0);
  });
});
