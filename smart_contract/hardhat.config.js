require('@nomiclabs/hardhat-waffle');

module.exports = {
    solidity: '0.8.0',
    networks: {
        sepolia: {
            url: 'https://eth-sepolia.g.alchemy.com/v2/TRIUP0DnHQUV5BRGdMfzPYsLMtXkzKHD',
            accounts: ['31aaa501c1ffc0ca68833afe9fbb406abb382f8c6a778b788a9a72d2f40895f7']
        }
    }
}