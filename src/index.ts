import * as fs from "fs";
import * as path from "path";
import { setInterval } from "timers/promises";
import { Spinner } from "cli-spinner";
import * as emoji from "node-emoji";
import clc from "cli-color";
import yesno from "yesno";

// pkgの環境変数を使うためのアンビエント宣言
declare const process: NodeJS.Process & {
  pkg: boolean | undefined;
};

const isDev = process.env.NODE_ENV == "development";

const VERSION = "0.2.1";

/**
 * エントリポイントとなるメインの関数。
 */
class Main {
  /**
   * 作業ディレクトリ
   */
  private readonly workDir: string;

  /**
   * Prefixer自体の実行ファイル名
   */
  private readonly selfName: string;

  /**
   * 正規表現
   */
  private readonly regEx: RegExp;

  /**
   * ファイルを監視する間隔
   */
  private readonly updateRate: number;

  /**
   * 監視の対象となるファイル群
   */
  private targetFiles: string[];

  /**
   * プレフィックスが付与されていないファイル
   */
  private unProcessed: string[];

  /**
   * プレフィックスが付与されているファイル
   */
  private processed: string[];

  /**
   * 最新のプレフィックス番号
   */
  private latestPrefix: number;

  /**
   * 監視中を表すスピナーアニメーション
   */
  private readonly loadingSpinner: Spinner;

  // コンストラクタ
  constructor() {
    this.workDir = process.pkg
      ? path.dirname(process.execPath)
      : path.resolve(process.cwd(), isDev ? "test" : "");
    this.selfName = path.basename(process.execPath);
    this.regEx = /^[0-9]{3}_/;
    this.updateRate = 1000; // 更新間隔は1秒ごとをデフォルトにする
    this.targetFiles = [];
    this.unProcessed = [];
    this.processed = [];
    this.latestPrefix = 0;
    this.loadingSpinner = new Spinner(
      clc.cyan("Watching for file changes..."),
    ).setSpinnerString(25); // スピナーの種類は25とする。

    // Welcomeメッセージ
    console.clear();
    console.log(
      emoji.get(":pushpin:"),
      "Prefixer - Auto Prefix Adder for files v" + VERSION,
    );
    console.log(
      clc.blackBright("\tMade with ") +
        clc.red("♥︎") +
        " by Bistalink. MIT License.\n",
    );
    console.log(clc.blackBright("Working Directory:\t"), this.workDir);
    console.log(clc.blackBright("Executable name:\t"), this.selfName);
    console.log();
    console.log("Target Expression:\t", this.regEx);
    console.log(
      `\n----------\nPress ${clc.redBright("Ctrl + C")} or ${clc.redBright(
        "close console window",
      )} to quit\n----------`,
    );
    console.log();
    this.main();
  }

  /**
   * メインの関数。await構文を使うためconstructorから切り離してある
   */
  async main() {
    // 作業ディレクトリが正しいか確認
    const confirm = await yesno({
      question: `Before begin, Is the detected working directory correct?\nIf not, your files can accidentaly get renamed. (${clc.green(
        `${clc.bold.underline("yes")} / no`,
      )})`,
      defaultValue: true,
    });

    if (!confirm) {
      console.log(
        "\nMake sure to run this program from inside your desired folder",
      );
      process.exit();
    }
    console.log();

    // 確認間隔ごとにループ
    // eslint-disable-next-line no-unused-vars
    for await (const i of setInterval(this.updateRate)) {
      // スピナーを回す
      if (!this.loadingSpinner.isSpinning()) {
        this.loadingSpinner.start();
      }

      try {
        this.loop();
      } catch (e) {
        console.log("\nCouldn't rename file. Skipping...\n");
      }
    }
  }

  // メインのループ
  loop() {
    let newPrefix;

    this.updateFileInfo();
    newPrefix = this.latestPrefix + 1;

    if (this.unProcessed.length == 0) {
      return;
    }

    // ファイル処理ここから
    this.loadingSpinner.stop();
    console.log(); // 空行

    for (const oldName of this.unProcessed) {
      const newName = ("000" + newPrefix).slice(-3) + "_" + oldName;

      fs.renameSync(
        path.resolve(this.workDir, oldName),
        path.resolve(this.workDir, newName),
      );
      console.log(`${oldName}\t>>\t${clc.greenBright(newName)}`);
      newPrefix++;
    }

    console.log(); // 空行
  }

  /**
   * 作業ディレクトリのファイル情報を更新
   */
  updateFileInfo(): void {
    this.targetFiles = fs
      .readdirSync(this.workDir, { withFileTypes: true })
      .filter((dirent) => {
        // 無視すべきファイルやフォルダを削除
        return dirent.isFile() && !this.shouldIgnore(dirent.name);
      })
      .map((dirent) => {
        // ファイル名の配列を生成
        return dirent.name;
      })
      .sort((a, b) => {
        // ファイルの更新日が古い順に並び替え
        const mtimeA = fs.statSync(path.resolve(this.workDir, a)).mtime;
        const mtimeB = fs.statSync(path.resolve(this.workDir, b)).mtime;
        if (mtimeA > mtimeB) {
          return 1;
        } else if (mtimeA < mtimeB) {
          return -1;
        } else {
          return 0;
        }
      });

    this.unProcessed = this.targetFiles.filter((value) => {
      return !this.regEx.test(value);
    });

    this.processed = this.targetFiles
      .filter((value) => {
        return this.regEx.test(value);
      })
      .sort();

    this.latestPrefix =
      this.processed.length != 0
        ? parseInt(this.processed[this.processed.length - 1].slice(0, 3))
        : -1;
  }

  /**
   *
   * @param fileName 無視するべきファイル（リネーム対象外のファイル）かどうかを判別する
   * @returns true: 無視すべき, false: 含めるべき
   */
  shouldIgnore(fileName: string) {
    return (
      fileName == this.selfName || // Prefixer自体の実行ファイルは対象外
      fileName == ".DS_Store" // macOSの.DS_Storeファイルは対象外
    );
  }
}

new Main();
