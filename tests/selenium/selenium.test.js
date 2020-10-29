const { Builder, By, Key, util } = require("selenium-webdriver");
require('chromedriver');
require("regenerator-runtime");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(async () => {
    jest.setTimeout(20000);
})

describe('dashboard', () => {
    test('go button exists', async () => {
        
        const driver = await new Builder().forBrowser("chrome").build();    
        try {
            await driver.get("https://www.koios.online/newviewer");
            await sleep(3000);
            
            let result = await driver.findElement(By.xpath("/html/body/div[2]/div[9]/div[3]/div/div[1]/div[3]/div")).getText();      
            expect(result).toBe("GO!");
        } finally { 
            driver.close(); 
        }
    });
    test('go button click', async () => {
        
        const driver = await new Builder().forBrowser("chrome").build();    
        try {
            await driver.get("https://www.koios.online/newviewer");
            await sleep(3000);
            await driver.findElement(By.xpath("/html/body/div[2]/div[9]/div[3]/div/div[1]/div[3]/div")).click();
            
            let result = await driver.findElement(By.xpath("/html/body/div[1]/div[1]/div[2]/div[1]/div[5]/div/div[1]/div/div[1]/img[2]")).getAttribute("data-src");
            expect(result).toBe("https://ipfs.io/ipfs/QmdFjFiaKaFCw5ocioFXHWGrFoZFTCk94oVobpxUrWP5Wv");
        } finally { 
            driver.close(); 
        }
    });
    test('settings button click', async () => {
        
        const driver = await new Builder().forBrowser("chrome").build();    
        try {
            await driver.get("https://www.koios.online/newviewer");
            await sleep(3000);
            await driver.findElement(By.xpath("/html/body/div[2]/div[9]/div[1]/div[2]/img")).click();
            
            let result = await driver.findElement(By.xpath("/html/body/div[7]/div[2]/div[5]/div[2]")).getText();
            expect(result).toBe("Settings");
        } finally { 
            driver.close(); 
        }
    });
    test('community button click', async () => {
        
        const driver = await new Builder().forBrowser("chrome").build();    
        try {
            await driver.get("https://www.koios.online/newviewer");
            await sleep(3000);
            await driver.findElement(By.xpath("/html/body/div[2]/div[10]/div/div[3]/div[1]/div[3]/div")).click();
            
            let result = await driver.findElement(By.xpath("/html/body/div[12]/div[2]/div[2]/div[1]")).getText();
            expect(result).toBe("Leaderboard");
        } finally { 
            driver.close(); 
        }
    });
});
