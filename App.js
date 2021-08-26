import React, {useEffect, useState} from 'react';
import type {Node} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Interface} from '@ethersproject/abi';
import {Contract} from '@ethersproject/contracts';
import Multicall from './src/abi/Multicall.json';
import TestToken from './src/abi/TestToken.json';
import {InfuraProvider} from '@ethersproject/providers';

const address = '0x16C400e306aD030aBC2da15b5535DF8a5A3B0c9a';

//----------------------------------------------------------------------------------------
// get Multical address here: https://github.com/makerdao/multicall
//----------------------------------------------------------------------------------------
// const multicallAddressRinkeby = '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821';
const multicallAddress = '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a';

const tokenAddress = [
  '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  '0x9792F3977Ac74833EA55Da9B2Aa63277eaB05A5C',
  '0xE680fA3CF20cAaB259Ab3E2d55a29C942ad72d01',
  '0x0B22E57e4e1E236f1E4C4d68c15E064E1Cc2e265',
  '0x0675A944CbEa834cddA62F24a08cE42d0fbb83A3',
  '0x834432F7F92541F42774552F9f55683148d69808',
  '0xA2d975933F65351834592E19e783e52e13cd2546',
  '0x18c6fFF449E1af4EE68526164C173460e07f1BE5',
  '0xA23dD33ab3d508901E810d065b5C31d4d3e42Dbf',
  '0x855c07E4d29e73057705194A391a83b9c32D6C67',
  '0x9B3c988D26bC51fE48714dda8Eaa816EE2Aa78a0',
  '0x24E717E24E175ae41313E5db341732c3785F6ca1',
  '0xc3737a066fAe30614db8E01c264331fCa852b4Ae',
];

const provider = new InfuraProvider(
  'kovan',
  'd09be685076c4be8a75c52f9cde4cabc',
);

const App: () => Node = () => {
  const [balances, setBalances] = useState([]);

  const getBalances = async () => {
    try {
      const promises = [];
      const multi = new Contract(multicallAddress, Multicall.abi, provider);
      const calls = [];
      const testToken = new Interface(TestToken.abi);
      tokenAddress.map(token => {
        calls.push([
          token,
          testToken.encodeFunctionData('balanceOf', [address]),
        ]);
      });
      promises.push(multi.aggregate(calls));
      promises.push(multi.getEthBalance(address));
      const newBalances = {};
      const [[, response], ethBalance] = await Promise.all(promises);
      newBalances.eth = ethBalance.toString();
      let i = 0;
      response.forEach(value => {
        if (tokenAddress && tokenAddress[i]) {
          const balanceNumber = testToken.decodeFunctionResult(
            'balanceOf',
            value,
          );
          newBalances[tokenAddress[i]] = balanceNumber.toString();
        }
        i++;
      });
      setBalances(newBalances);
      return newBalances;
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    getBalances();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Multicall</Text>
      <Text>{JSON.stringify(balances)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
