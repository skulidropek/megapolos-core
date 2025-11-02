const { NodeSSH } = require('node-ssh');
import si from 'systeminformation';

export interface NodeForSystemInfo {
  id: string;
  host: string;
  user?: string;
  password?: string;
}

export interface NormalizedSystemInfo {
  totalMemoryMb: number | null;
  availableMemoryMb: number | null;
  cpuCores: number | null;
  totalDiskGb: number | null;
  freeDiskGb: number | null;
}

export class SystemInfoCollector {
  private isLocal(host: string): boolean {
    const localHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
    return localHosts.includes(host);
  }

  async collect(node: NodeForSystemInfo): Promise<NormalizedSystemInfo> {
    try {
      if (this.isLocal(node.host)) {
        return await this.getLocalSystemInfo();
      } else {
        return await this.getRemoteSystemInfo(node);
      }
    } catch (error) {
      console.warn(
        `Не удалось получить системную информацию для ноды ${node.id}:`,
        error.message
      );
      return {
        totalMemoryMb: null,
        availableMemoryMb: null,
        cpuCores: null,
        totalDiskGb: null,
        freeDiskGb: null,
      };
    }
  }

  private async getLocalSystemInfo(): Promise<NormalizedSystemInfo> {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const disks = await si.fsSize();
    const rootDisk = disks.find((d) => d.mount === '/') || disks[0];

    return {
      totalMemoryMb: parseInt((mem.total / 1024 ** 2).toFixed(0)),
      availableMemoryMb: parseInt((mem.available / 1024 ** 2).toFixed(0)),
      cpuCores: cpu.physicalCores,
      totalDiskGb: rootDisk
        ? parseFloat((rootDisk.size / 1024 ** 3).toFixed(2))
        : null,
      freeDiskGb: rootDisk
        ? parseFloat((rootDisk.available / 1024 ** 3).toFixed(2))
        : null,
    };
  }

  private async getRemoteSystemInfo(
    node: NodeForSystemInfo
  ): Promise<NormalizedSystemInfo> {
    const ssh = new NodeSSH();

    try {
      await ssh.connect({
        host: node.host,
        username: node.user,
        password: node.password,
      });

      const memResult = await ssh.execCommand('free -b');
      const memLines = memResult.stdout.trim().split('\n');
      const memValues = memLines[1].split(/\s+/).filter(Boolean);
      const totalMem = parseInt(memValues[1], 10);
      const availableMem = parseInt(memValues[6], 10);

      const diskResult = await ssh.execCommand(
        "df -B1 / | awk 'NR==2 {print $2, $4}'"
      );
      let totalDisk = null,
        availableDisk = null;
      if (diskResult.stdout.trim()) {
        const [total, available] = diskResult.stdout
          .trim()
          .split(/\s+/)
          .map(Number);
        totalDisk = total;
        availableDisk = available;
      }

      const cpuResult = await ssh.execCommand('nproc');
      const cpuCores = parseInt(cpuResult.stdout.trim(), 10) || null;

      return {
        totalMemoryMb: totalMem
          ? parseInt((totalMem / 1024 ** 2).toFixed(0))
          : null,
        availableMemoryMb: availableMem
          ? parseInt((availableMem / 1024 ** 2).toFixed(0))
          : null,

        totalDiskGb: totalDisk
          ? parseFloat((totalDisk / 1024 ** 3).toFixed(2))
          : null,
        freeDiskGb: availableDisk
          ? parseFloat((availableDisk / 1024 ** 3).toFixed(2))
          : null,

        cpuCores: cpuCores,
      };
    } finally {
      ssh.dispose();
    }
  }
}
