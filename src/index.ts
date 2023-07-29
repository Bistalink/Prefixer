import * as fs from "fs";
import * as path from "path";
import { setInterval } from "timers/promises";
import { Spinner } from "cli-spinner";
import * as emoji from "node-emoji";
import clc from "cli-color";
import yesno from "yesno";

declare const process: NodeJS.Process & {
    pkg: boolean | undefined
}

// 開発環境かどうかのフラグ
const isDev = process.env.NODE_ENV == "development";

// バージョン情報
const VERSION = "0.2.0";

class Main{
    private workDir = process.pkg ? path.dirname(process.execPath) : path.resolve(process.cwd(), isDev ? "test" : "");
    private selfName = path.basename(process.execPath);
    private regEx = /^[0-9]{3}_/;                               // 正規表現。最初の数字3桁があるかどうか
    private updateRate = 1000;                                      // 更新間隔（ミリ秒）
    private fileList: string[] = [];
    private unProcessed: string[] = [];
    private processed: string[] = [];
    private latestPrefix: number  = 0;
    private spinner = new Spinner(clc.cyan("Watching for file changes..."));    // ファイル変更監視中のスピナー


    // コンストラクタ
    constructor(){
        this.spinner.setSpinnerString(25);                              // スピナーの種類
        console.clear();
        console.log(emoji.get(":pushpin:"),"Prefixer - Auto Prefix Adder for files v" + VERSION);
        console.log(clc.blackBright("\tMade with ") + clc.red("♥︎") + " by Bistalink. MIT License.\n");
        console.log(clc.blackBright("Working Directory:\t"), this.workDir);
        console.log(clc.blackBright("Executable name:\t"), this.selfName);
        console.log();
        console.log("Target Expression:\t", this.regEx);
        console.log(`\n----------\nPress ${clc.redBright("Ctrl + C")} or ${clc.redBright("close console window")} to quit\n----------`);
        console.log();
        this.main();
    }


    // メイン
    async main(){
        // 作業ディレクトリが正しいか確認
        const setup = await yesno({
            question: `Before begin, Is the detected working directory correct?\nIf not, your files can accidentaly get renamed. (${clc.green(`${clc.bold.underline("yes")} / no`)})`,
            defaultValue: true
        });
        // プロンプトが拒否されたらプログラムを終了
        if (!setup){
            console.log("\nMake sure to run this program from inside your desired folder");
            process.exit();
        }
        console.log();
        // 更新間隔ごとにループ
        for await (const i of setInterval(this.updateRate)){
            // スピナーを回す
            if (!this.spinner.isSpinning()){
                this.spinner.start();
            }
            // メインのループを開始する。ファイルがビジー状態でリネームできなかった場合は例外をキャッチしてスキップ
            try{
                this.loop();            
            }
            catch (e){
                console.log("\nCouldn't rename file. Skipping...\n");
            }
        }
    }


    // メインのループ
    loop(){
        let newPrefix;

        this.analyzeFiles();                        // ファイル一覧を分析する
        newPrefix = this.latestPrefix + 1;          // 最新の通し番号を1つ増やす
        if (this.unProcessed.length == 0){          // 未処理のファイルが存在しなかったらこのループは終了
            return;
        }
                                                    // 未処理のファイルが1つでもあったらここから
        this.spinner.stop();                        // スピナーを停止
        console.log();                              // 空行
        for (const oldName of this.unProcessed){    // 未処理のファイルを1つずつ処理
            const newName = ("000" + newPrefix).slice(-3) + "_" +oldName;
            
            fs.renameSync(path.resolve(this.workDir, oldName), path.resolve(this.workDir, newName));
            console.log(`${oldName}\t>>\t${clc.greenBright(newName)}`);
            newPrefix++;
        }
        console.log();  // 空行
        this.analyzeFiles();
    }


    // ファイル情報を取得するやつ
    analyzeFiles(): void{
        // ファイルのリスト
        this.fileList = this.getFileList(this.workDir).sort((a, b)=>{
            const mtimeA = fs.statSync(path.resolve(this.workDir, a)).mtime;
            const mtimeB = fs.statSync(path.resolve(this.workDir, b)).mtime;
            if (mtimeA > mtimeB)
                return 1;
            else if (mtimeA < mtimeB)
                return -1;
            else
                return 0;
        });
        // 添え字がついてないやつのリスト
        this.unProcessed = this.fileList.filter((value)=>{
            return !this.regEx.test(value);
        });
        // 添え字がついてるやつのリスト
        this.processed = this.fileList.filter(value=>{
            return this.regEx.test(value);
        }).sort();
        // 一番新しい添え字
        this.latestPrefix = (this.processed.length != 0) ? (parseInt(this.processed[this.processed.length - 1].slice(0, 3))) : -1;
    }

    // ファイルのリストを取得するやつ（フォルダには反応しないやつ）
    getFileList(filePath: string): string[]{
        // 対象がファイルでかつ無視すべきファイルでない（リネームしてもよい）ファイルを抽出
        return fs.readdirSync(filePath, {withFileTypes: true}).filter(dirent =>{
            return dirent.isFile() && !this.shouldIgnore(dirent.name)
        }).map(dirent => {
            return dirent.name;
        })
    }

    // 無視するべきファイル（リネーム対象外のファイル）かどうかを判別する
    shouldIgnore(fileName: string){
        // 無視すべきファイルのときはtrueを返す。orでつなぐ
        return (
            fileName == this.selfName ||    // Prefixer自体の実行ファイルは対象外
            fileName == ".DS_Store"         // macOSの.DS_Storeファイルは対象外
        )
    }
}

new Main();