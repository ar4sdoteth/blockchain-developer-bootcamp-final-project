import {Contract} from 'ethers';
import {ethers} from 'hardhat';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';

export async function setupUsers<T extends {[contractName: string]: Contract}>(
  addresses: string[],
  contracts: T
): Promise<({address: string} & T)[]> {
  const users: ({address: string} & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends {[contractName: string]: Contract}>(
  address: string,
  contracts: T
): Promise<{address: string} & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = {address};
  for (const key of Object.keys(contracts)) {
    const signer = await ethers.getSigner(address);

    // console.log(`signer`, signer);

    user[key] = contracts[key].connect(signer);
    // console.log(`user`, key);
  }
  return user as {address: string} & T;
}

export async function setupNamedUsers<T extends {[contractName: string]: Contract}>(
  _account: {[name: string]: string},
  _contracts: T
): Promise<{[name: string]: {address: string} & T}> {
  let result: {[name: string]: {address: string} & T} = {};
  const iterableObj = {
    async *[Symbol.asyncIterator]() {
      for (const item in _account) {
        yield {[item]: await setupUser(_account[item], _contracts)};
      }
    },
  };
  for await (const item of iterableObj) {
    result = {
      ...result,
      ...item,
    };
  }
  return result;
}
