import {getSdk} from 'balena-sdk'

const sdk = getSdk({
	apiUrl: "https://api.balena-cloud.com/",
})

const params = {
  uuid: process.argv[2]
}

const test = async (params) => {

	console.log("uuid:", params.uuid)

  // Get device info
	const { uuid, is_of__device_type, os_version, os_variant } =
		(await sdk.models.device.get(params.uuid, {
			$select: ['uuid', 'os_version', 'os_variant'],
			$expand: {
				is_of__device_type: {
					$select: 'slug',
				},
			},
		}));

	console.log("os_version", os_version)
	console.log("os_variant", os_variant)

	// Get current device OS version
	const currentOsVersion = sdk.models.device.getOsVersion({
		os_version,
		os_variant,
	});
	if (!currentOsVersion) {
		throw new ExpectedError(
			'The current os version of the device is not available',
		);
	}

	console.log("currentOsVersion", currentOsVersion)

	// Get supported OS update versions
	const hupVersionInfo = await sdk.models.os.getSupportedOsUpdateVersions(
		is_of__device_type[0].slug,
		currentOsVersion,
	);
	if (hupVersionInfo.versions.length === 0) {
		throw new ExpectedError(
			'There are no available Host OS update targets for this device',
		);
	}

	console.log("hupVersionInfo", hupVersionInfo)

}

test(params)